import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { Context } from 'telegraf'

const LOG_NAME = '[ChartCommand::Message]'

export const chartCommand = async (ctx: Context) => {
  try {
    await ctx.reply('chartCommand <Todo>', {
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
  } catch (error: any) {
    await ctx.reply(error?.data?.message || 'Error Occurred')
  }
}
