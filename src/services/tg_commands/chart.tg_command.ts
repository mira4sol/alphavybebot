import { TelegramUpdate } from '@/types'
import { bot } from '@/utils/platform'

const LOG_NAME = '[ChartCommand::Message]'

export const chartCommand = async (
  chat_id: string,
  payload: TelegramUpdate
) => {
  try {
    const text = payload?.message?.text
    await bot.telegram.sendMessage(chat_id, 'chartCommand <Todo>')
  } catch (error: any) {
    await bot.telegram.sendMessage(
      chat_id,
      error?.data?.message || 'Error Occurred'
    )
  }
}
