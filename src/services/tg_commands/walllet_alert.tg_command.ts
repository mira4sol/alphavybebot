import { SubscriptionModel } from '@/models/subscription.model'
import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { appLogger } from '@/utils/logger.util'
import { isValidSolanaAddress } from '@/utils/solana.lib'
import { AddressType } from '@prisma/client'
import { Context } from 'telegraf'

export const walletAlertCommand = async (ctx: Context, type: AddressType) => {
  let deleteMessageId = 0

  try {
    const wallet_address = ctx.text?.split(' ')[1]
    const level = ctx.text?.split(' ')[2]
    const price = ctx.text?.split(' ')[3]

    if (!wallet_address || !isValidSolanaAddress(wallet_address?.trim())) {
      let txt = `❌ Invalid Input!
     └ ${
       type === 'Wallet'
         ? 'Use /wa <wallet address>, e.g. /wa 5QDwYS1CtHzN1oJ2eij8Crka4D2eJcUavMcyuvwNRM9'
         : 'Use /ta <token address>, e.g. /ta JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
     }`

      return await ctx.reply(txt, {
        reply_parameters: { message_id: ctx?.msgId || 0 },
        reply_markup: {
          inline_keyboard: [tgDeleteButton],
        },
      })
    }

    // if it a token and a group, only admins should be able to use it
    if (ctx?.chat?.type !== 'private') {
      const admins = await ctx.getChatAdministrators()
      const isAdmin = admins.some((adm) => adm.user.id === ctx?.from?.id)
      if (!isAdmin)
        return await ctx.reply(
          // `❌ Only admins can use this command in groups to avoid spamming`,
          `❌ Send me a DM to use this command`,
          {
            reply_parameters: { message_id: ctx?.msgId || 0 },
            reply_markup: {
              inline_keyboard: [tgDeleteButton],
            },
          }
        )
    }

    deleteMessageId =
      (
        await ctx.reply('⏳ Subscribing...', {
          reply_parameters: { message_id: ctx?.msgId || 0 },
        })
      )?.message_id || 0

    await SubscriptionModel.subscribed({
      address: wallet_address,
      address_type: type,
      chat_id: ctx.chat?.id?.toString() || '',
    })

    ctx.reply(
      `✅ Successfully subscribed to ${
        type === 'Wallet' ? 'wallet' : 'token'
      }: ${wallet_address}
      
to unsubscribe use /ca ${wallet_address} `,
      {
        reply_parameters: { message_id: ctx?.msgId || 0 },
        reply_markup: {
          inline_keyboard: [tgDeleteButton],
        },
      }
    )
  } catch (error: any) {
    appLogger.error('Error fetching wallet alert: ', error)
    const msg = error?.data?.message || error?.message || 'Unable to subscribe'
    await ctx.reply('❗️ Oh chim 🥹\n' + msg, {
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
