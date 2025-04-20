import vybe from '@api/vybe-api'
import { Telegraf } from 'telegraf'
import { ENV } from './constants/env.constants'

export const bot = new Telegraf(ENV.TELEGRAM_TOKEN || '')

// bot.launch({
//   webhook: {
//     domain: ENV.TELEGRAM_HOOK_URL || '',
//     path: '/v1/tg-hook/',
//   },
// })
console.log('tg env', ENV.TELEGRAM_TOKEN)
console.log('tg web-hook', ENV.TELEGRAM_HOOK_URL || '' + '/v1/tg-hook')

vybe.auth(ENV.VIBE_API_KEY || '')

export const vybeApi = vybe
