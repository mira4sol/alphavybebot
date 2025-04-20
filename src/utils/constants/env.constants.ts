import dotenv from 'dotenv'
dotenv.config()

export const ENV = {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
  TELEGRAM_HOOK_URL: process.env.TELEGRAM_HOOK_URL,
  TELEGRAM_HOOK_URL_PATH: process.env.TELEGRAM_HOOK_URL_PATH,
  VIBE_API_KEY: process.env.VIBE_API_KEY,
  SUPERBASE_URL: process.env.SUPERBASE_URL,
  SUPERBASE_KEY: process.env.SUPERBASE_KEY,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
}
