import { startMessage } from '@/utils/constants/tg-message.constant'
import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { appLogger } from '@/utils/logger.util'
import { Context } from 'telegraf'
import { messageCommand } from './message.tg_command'

const LOG_NAME = '[StartCommand::Start]'

export const startCommand = async (ctx: Context) => {
  const username = ctx?.message?.from?.username

  // const user = await UserModel.addUserIfNotExists(chat_id)

  try {
    // const refID = payload?.message?.text.split(' ')[1]
    // if (refID) {
    //   await UserModel.addReferral(refID, chat_id)
    // }

    const startParam = ctx.text?.split(' ')[1] // Gets the parameter after /start

    if (startParam?.startsWith('trade_')) {
      const mintAddress = startParam.replace('trade_', '')
      // Auto-send the mint address as a message
      ctx.state.mint = mintAddress
      return await messageCommand(ctx)
    }

    const photo_url = 'https://www.pixawallet.live/meta_dark.png'

    await ctx.sendPhoto(photo_url, {
      caption: startMessage(username ?? ''),
      // reply_markup: { inline_keyboard: reply_markup.inline_keyboard },
      parse_mode: 'Markdown',
      reply_parameters: { message_id: ctx?.msgId || 0 },
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
  } catch (error: any) {
    appLogger.error(`[${LOG_NAME} ${error.message}]`)
    const msg = error?.data?.message || error?.message || 'An error occurred'
    await ctx.reply('❌ Oh chim 🥹\n' + msg, {
      reply_parameters: { message_id: ctx?.msgId || 0 },
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
  }
}

const reply_markup = {
  resize_keyboard: 'true',
  inline_keyboard: [
    [
      {
        text: 'Join Chat',
        // url: 'https://t.me/VybeChat',
        callback_data: 'click3',
        //web_app: 'https://t.me/InFuseWalletbot'
      },
    ],
    [
      {
        text: 'Follow Channel',
        // url: 'https://t.me/VybeChatChannel',
        callback_data: 'click1',
        //web_app: 'https://t.me/InFuseWalletbot'
      },
    ],

    // [
    //   {
    //     text: 'Follow us on X',
    //     url: 'https://twitter.com/infusewallet',
    //     callback_data: 'click0',
    //     //web_app: 'https://t.me/InFuseWalletbot'
    //   },
    // ],
  ],
}
