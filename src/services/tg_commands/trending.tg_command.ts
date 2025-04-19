import { TelegramUpdate } from '@/types'
import { bot } from '@/utils/platform'

const LOG_NAME = '[TrendingCommand::Message]'

export const trendingCommand = async (
  chat_id: string,
  payload: TelegramUpdate
) => {
  try {
    const text = payload?.message?.text
    await bot.telegram.sendMessage(chat_id, 'TrendingCommand <Todo>')
  } catch (error: any) {
    await bot.telegram.sendMessage(
      chat_id,
      error?.data?.message || 'Error Occurred'
    )
  }
}
