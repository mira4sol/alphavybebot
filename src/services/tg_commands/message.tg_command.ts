import { tgDeleteButton } from '@/utils/constants/tg.constants'
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
    const msg = error?.data?.message || error?.message || 'Unknown error'
    await ctx.reply('❌ Oh chim 🥹\n' + msg, {
      reply_parameters: { message_id: ctx?.msgId || 0 },
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
  }
}
