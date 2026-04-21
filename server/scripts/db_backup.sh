#!/bin/bash
set -euo pipefail

# Secure Database Backup Script
# Designed to be run via cron (e.g., `0 2 * * * /path/to/server/scripts/db_backup.sh`)

# Define variables. Ideally, these should be securely injected via environment or a .env file.
# Try to load from root .env if it exists
ENV_FILE="$(dirname "$0")/../../.env"
if [ -f "$ENV_FILE" ]; then
    # Load env vars ignoring comments
    export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

# Fallbacks in case env vars are not set
DB_CONTAINER_NAME="bnb_prod_db"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-postgres}"
S3_BUCKET="${AWS_S3_BUCKET_NAME:-my-db-backups}"
AWS_REGION="${AWS_REGION:-us-east-1}"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H%M%SZ")
BACKUP_DIR="/tmp/db_backups"
BACKUP_FILENAME="${DB_NAME}_${TIMESTAMP}.sql.gz"
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_FILENAME}"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting backup of database '${DB_NAME}'..."

# Ensure local backup directory exists
mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

# Run pg_dump inside the db container and stream it to a compressed local file
# We use -e PGPASSWORD to avoid password prompts if trust authentication isn't used
docker exec -e PGPASSWORD="${POSTGRES_PASSWORD:-}" "${DB_CONTAINER_NAME}" \
    pg_dump -U "${DB_USER}" "${DB_NAME}" | gzip > "${BACKUP_FILE}"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Database dumped and compressed to ${BACKUP_FILE}"

# Upload to AWS S3 using AWS CLI
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Uploading to S3 bucket '${S3_BUCKET}'..."

aws s3 cp "${BACKUP_FILE}" "s3://${S3_BUCKET}/db_backups/${BACKUP_FILENAME}" \
    --region "${AWS_REGION}" \
    --storage-class STANDARD_IA

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Upload successful."

# Clean up the local backup file to prevent disk space exhaustion
rm -f "${BACKUP_FILE}"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Backup process completed successfully."
