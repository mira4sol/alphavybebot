import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { appLogger } from '@/utils/logger.util'
import { Context } from 'telegraf'

const LOG_NAME = '[premiumCommand::Message]'

export const premiumCommand = async (ctx: Context) => {
  try {
    await ctx.reply(
      `
Subscribe to pro to unlock more features, do more setting up alerts for tokens and catch up with the trends in real time.
Coming soon`,
      {
        reply_parameters: { message_id: ctx?.msgId || 0 },
        reply_markup: {
          inline_keyboard: [tgDeleteButton],
        },
      }
    )
  } catch (error: any) {
    appLogger.error(`[${LOG_NAME} ${error.message}]`)
    const msg =
      error?.data?.message || error?.message || 'Unable to fetch trend'
    await ctx.reply('❌ Oh chim 🥹\n' + msg, {
      reply_parameters: { message_id: ctx?.msgId || 0 },
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
  }
}
