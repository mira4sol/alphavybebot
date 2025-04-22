import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { appLogger } from '@/utils/logger.util'
import { Context } from 'telegraf'

const LOG_NAME = '[TrendingCommand::Message]'

export const trendingCommand = async (ctx: Context) => {
  try {
    await ctx.reply('TrendingCommand <Todo>', {
      reply_parameters: { message_id: ctx?.msgId || 0 },
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
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
