import vybe from '@api/vybe-api'
import { Telegraf } from 'telegraf'
import { ENV } from './constants/env.constants'

export const bot = new Telegraf(ENV.TELEGRAM_TOKEN || '')

bot.launch({
  webhook: {
    domain: ENV.TELEGRAM_HOOK_URL || '',
    path: '/v1/tg-hook',
  },
})

bot.on('message', (ctx) => {
  console.log(ctx.message)

  ctx.telegram.sendMessage(ctx.message.chat.id, 'test message', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Click me',
            callback_data: 'click_me',
          },
          {
            text: 'Test me',
            callback_data: 'test_me',
          },
        ],
      ],
    },
  })
})

bot /* The code snippet `bot.action('test_me', (ctx) => { console.log('test_me', ctx) })` and
`bot.action('click_me', (ctx) => { console.log('click_me', ctx) })` is setting up event handlers
for when a user interacts with the Telegram bot through inline keyboard buttons. */
  .action('test_me', (ctx) => {
    console.log('test_me', ctx)
  })

bot.action('click_me', (ctx) => {
  console.log('click_me', ctx)
})

vybe.auth(ENV.VIBE_API_KEY || '')

export const vybeApi = vybe
