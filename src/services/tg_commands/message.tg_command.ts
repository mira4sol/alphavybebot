import { TelegramUpdate } from '@/types'
import { bot } from '@/utils/platform'
import { isMintAddress } from '@/utils/solana.helper'
import { tokenResponse } from '@/utils/tg_response/token.response'

const LOG_NAME = '[MessageCommand::Message]'

export const messageCommand = async (
  chat_id: string,
  payload: TelegramUpdate
) => {
  try {
    // console.log('messageCommand', payload)

    const text = payload?.message?.text

    if (isMintAddress(text)) {
      return await tokenResponse.tokenDetails(payload)
    }
  } catch (error: any) {
    await bot.telegram.sendMessage(
      chat_id,
      error?.data?.message || 'Error Occurred'
    )
  }
}
