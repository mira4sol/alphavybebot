import vybe from '@api/vybe-api'
import { session, Telegraf } from 'telegraf'
import { ENV } from './constants/env.constants'
import { appLogger } from './logger.util'

export const bot = new Telegraf(ENV.TELEGRAM_TOKEN || '')

// Add this error handler before bot.launch()
bot.catch((err, ctx) => {
  appLogger.error('Telegraf error occurred', err)
  // Optionally, notify the user
  // ctx.reply('❌ An unexpected error occurred. Please try again later.');
})

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
