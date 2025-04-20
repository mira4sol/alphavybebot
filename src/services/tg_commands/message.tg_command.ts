import { TelegramUpdate } from '@/types'
import { bot } from '@/utils/platform'
import { isMintAddress } from '@/utils/solana.helper'
import { tokenResponse } from '@/utils/tg_response/token.response'
import { Context } from 'telegraf'

const LOG_NAME = '[MessageCommand::Message]'

export const messageCommand = async (ctx: Context) => {
  try {
    // console.log('messageCommand', payload)
    if (isMintAddress(ctx?.text || '')) {
      return await tokenResponse.tokenDetails(ctx)
    }
  } catch (error: any) {
    await ctx.reply(error?.data?.message || 'Error Occurred')
  }
}
