import { config } from 'dotenv';
config();

function getEnvVariable(key: string, required = true): string {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value!;
}

export const configs = {
  REDIS_URL: getEnvVariable('REDIS_URL'),
  AUTH_EMAIL: getEnvVariable('AUTH_EMAIL'),
  AUTH_PASS: getEnvVariable('AUTH_PASS'),
  ACCESS_TOKEN_SECRET: getEnvVariable('ACCESS_TOKEN_SECRET'),
  REFRESH_TOKEN_SECRET: getEnvVariable('REFRESH_TOKEN_SECRET'),
};
