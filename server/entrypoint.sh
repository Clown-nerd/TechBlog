#!/bin/sh
# Entrypoint script: run migrations then start the production server.
set -e

echo "Running database migrations..."
npm run db:migrate

echo "Migrations complete. Starting server..."
exec node dist/index.js
