import { tgDeleteButton } from '@/utils/constants/tg.constants'
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
    await ctx.reply(error?.data?.message || 'Error Occurred')
  }
}
