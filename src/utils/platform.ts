import vybe from '@api/vybe-api'
import { session, Telegraf } from 'telegraf'
import { ENV } from './constants/env.constants'
import { appLogger } from './logger.util'

export const bot = new Telegraf(ENV.TELEGRAM_TOKEN || '')

if (!ENV.REDIS_URL) {
  appLogger.error('REDIS_URL is not set in environment variables')
  process.exit(1)
}

// const store = Redis<SessionData>({
//   url: ENV.REDIS_URL,
// })

// bot.use(session({ store }))
bot.use(session())

bot.launch({
  webhook:
    ENV.TELEGRAM_CONNECTION_TYPE === 'webhook'
      ? {
          domain: ENV.TELEGRAM_HOOK_URL || '',
          path: ENV.TELEGRAM_HOOK_URL_PATH || '/v1/tg-hook',
        }
      : undefined,
})

vybe.auth(ENV.VIBE_API_KEY || '')

export const vybeApi = vybe
