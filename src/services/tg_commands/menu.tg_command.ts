import { WalletModel } from '@/models/wallet.model'
import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { appLogger } from '@/utils/logger.util'
import { Context } from 'telegraf'

export const menuCommand = async (ctx: Context) => {
  let deleteMessageId = 0

  try {
    // if it a token and a group, only admins should be able to use it
    if (ctx?.chat?.type !== 'private') {
      throw new Error(`❌ Send me a DM to use this command`)
    }

    deleteMessageId =
      (
        await ctx.reply('⏳ Loading menu...', {
          reply_parameters: { message_id: ctx?.msgId || 0 },
        })
      )?.message_id || 0
    await ctx.sendChatAction('typing')

    // Get user's wallet
    const wallet = await WalletModel.findWalletByTelegramId(
      ctx.from?.id?.toString() || ''
    )
    if (!wallet) throw new Error('Wallet not found')

    let message = `🎯 *Vybe Bot Menu*\n\n`
    message += `*Your Wallet:*\n\`${wallet.public_key}\`\n\n`
    message += `Select an option below to get started:\n\n`
    message += `*Wallet Management:*\nView and manage your wallet details\n\n`
    message += `*Token Actions:*\nBuy tokens and view market data\n\n`
    message += `*Tracking:*\nMonitor wallets and tokens\n\n`
    message += `*Market Data:*\nView trending and top tokens`

    await ctx.reply(message, {
      reply_parameters: { message_id: ctx?.msgId || 0 },
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '👛 View Wallet', callback_data: 'menu:view_wallet' }],
          [
            { text: '💎 Buy Token', callback_data: 'menu:buy_token' },
            { text: '💎 Sell Token', callback_data: 'menu:sell_token' },
          ],
          [{ text: '🔍 Track Wallet', callback_data: 'menu:track_wallet' }],
          [
            {
              text: '📋 View Tracked Wallets',
              callback_data: 'menu:tracked_wallets',
            },
          ],
          [
            {
              text: '📈 Trending Solana Tokens',
              callback_data: 'menu:trending',
            },
          ],
          [{ text: '🌐 Top Solana Tokens', callback_data: 'menu:top_solana' }],
          [{ text: '🌍 Top Global Tokens', callback_data: 'menu:top_global' }],
          [
            { text: '⚙️ Settings', callback_data: 'menu:settings' },
            { text: '📤 Share Bot', callback_data: 'menu:share' },
          ],
          tgDeleteButton,
        ],
      },
    })
  } catch (error: any) {
    appLogger.error('Error in menu command: ', error)
    const msg = error?.data?.message || error?.message || 'Unable to show menu'
    await ctx.reply(msg, {
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
