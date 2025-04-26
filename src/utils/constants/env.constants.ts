import dotenv from 'dotenv'
dotenv.config()

export const ENV = {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
  TELEGRAM_HOOK_URL: process.env.TELEGRAM_HOOK_URL,
  TELEGRAM_HOOK_URL_PATH: process.env.TELEGRAM_HOOK_URL_PATH,
  TELEGRAM_CONNECTION_TYPE: process.env.TELEGRAM_CONNECTION_TYPE || 'webhook',
  VIBE_API_KEY: process.env.VIBE_API_KEY,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  RUGCHECKER_API_KEY: process.env.RUGCHECKER_API_KEY,
}
