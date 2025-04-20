import vybe from '@api/vybe-api'
import { Telegraf } from 'telegraf'
import { ENV } from './constants/env.constants'

export const bot = new Telegraf(ENV.TELEGRAM_TOKEN || '')

bot.launch({
  webhook: {
    domain: ENV.TELEGRAM_HOOK_URL || '',
    path: ENV.TELEGRAM_HOOK_URL_PATH || '/v1/tg-hook',
  },
})

vybe.auth(ENV.VIBE_API_KEY || '')

export const vybeApi = vybe
