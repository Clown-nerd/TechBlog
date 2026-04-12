import { z } from 'zod';
import dotenv from 'dotenv';

// Load variables from .env if present
dotenv.config();

const envSchema = z.object({
  AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
  AWS_S3_BUCKET_NAME: z.string().min(1, 'AWS_S3_BUCKET_NAME is required'),
  AWS_ENDPOINT: z.string().optional(),
});

export const getEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid AWS Environment Initialisation:', parsed.error.format());
    process.exit(1);
  }
  return parsed.data;
};

// Exporting a singleton parsed env
export const env = getEnv();
