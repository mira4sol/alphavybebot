import { WalletModel } from '@/models/wallet.model'
import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { appLogger } from '@/utils/logger.util'
import { Context } from 'telegraf'

export const balanceCommand = async (ctx: Context) => {
  let deleteMessageId = 0

  try {
    // if it a token and a group, only admins should be able to use it
    if (ctx?.chat?.type !== 'private') {
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
        await ctx.reply('⏳ Canceling subscription...', {
          reply_parameters: { message_id: ctx?.msgId || 0 },
        })
      )?.message_id || 0
    await ctx.sendChatAction('typing')

    const wallet = await WalletModel.findWalletByTelegramId(
      ctx.from?.id?.toString() || ''
    )
    console.log('wallet', wallet)
    ctx.reply(`✅ in dev`)
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
