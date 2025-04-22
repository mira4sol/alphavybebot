import { SubscriptionModel } from '@/models/subscription.model'
import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { appLogger } from '@/utils/logger.util'
import { isValidSolanaAddress } from '@/utils/solana.lib'
import { Context } from 'telegraf'

export const cancelAlertCommand = async (ctx: Context) => {
  let deleteMessageId = 0

  try {
    const wallet_address = ctx.text?.split(' ')[1]

    if (!wallet_address || !isValidSolanaAddress(wallet_address?.trim())) {
      let txt = `❌ Invalid Input!
     └ Use /ca <wallet or token address>, e.g. /ca 5QDwYS1CtHzN1oJ2eij8Crka4D2eJcUavMcyuvwNRM9`

      return await ctx.reply(txt, {
        reply_parameters: { message_id: ctx?.msgId || 0 },
        reply_markup: {
          inline_keyboard: [tgDeleteButton],
        },
      })
    }

    deleteMessageId =
      (
        await ctx.reply('⏳ Canceling subscription...', {
          reply_parameters: { message_id: ctx?.msgId || 0 },
        })
      )?.message_id || 0

    await SubscriptionModel.unsubscribed({
      address: wallet_address,
      chat_id: ctx.chat?.id?.toString() || '',
    })

    ctx.reply(`✅ ${wallet_address} alerts canceled`)
  } catch (error: any) {
    appLogger.error('Error fetching wallet balance: ', error)
    await ctx.reply(error?.data?.message || 'Unable to cancel alert')
    const msg = error?.data?.message || error?.message || 'Unable to subscribe'
    await ctx.reply('❌ Oh chim 🥹\n' + msg, {
      reply_parameters: { message_id: ctx?.msgId || 0 },
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
  } finally {
    if (deleteMessageId && deleteMessageId !== 0)
      await ctx.deleteMessage(deleteMessageId)
  }
}
