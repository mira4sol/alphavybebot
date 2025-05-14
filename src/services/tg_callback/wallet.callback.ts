import { WalletModel } from '@/models/wallet.model'
import { TelegrafCallbackContext } from '@/types/telegram.interface'
import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { appLogger } from '@/utils/logger.util'

export const walletCallbackHandler = async (ctx: TelegrafCallbackContext) => {
  const callbackData = ctx.match[1]
  const telegramId = ctx.from?.id.toString()

  await ctx.sendChatAction('typing')

  if (!telegramId) {
    return await ctx.answerCbQuery('Error: User ID not found')
  }

  try {
    switch (callbackData) {
      case 'export_wallet': {
        await ctx.answerCbQuery('Export wallet clicked')
        const message = await ctx.reply(
          '⚠️ *Export Wallet Warning*\n\n' +
            'You are about to export your wallet private key\\. This key gives full access to your wallet and funds\\.\n\n' +
            'You can import this key into:\n' +
            '• Phantom\n' +
            '• Backpack\n' +
            '• Solflare\n' +
            '• Other Solana wallets\n\n' +
            'Are you sure you want to proceed?',
          {
            parse_mode: 'MarkdownV2',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '✅ Yes, export wallet',
                    callback_data: 'wallet:confirm_export',
                  },
                  { text: '❌ Cancel', callback_data: 'wallet:cancel_export' },
                ],
              ],
            },
          }
        )

        // Delete message after 60 seconds
        setTimeout(async () => {
          try {
            await ctx.deleteMessage(message.message_id)
          } catch (error) {
            appLogger.error('Error deleting export message:', error)
          }
        }, 60000)
        break
      }

      case 'confirm_export': {
        await ctx.answerCbQuery('Exporting wallet...')

        // Get and decrypt private key
        const keypair = await WalletModel.decryptWalletKey(telegramId)
        const privateKey = Buffer.from(keypair.secretKey).toString('hex')

        const message = await ctx.reply(
          '🔑 *Your Wallet Private Key*\n\n' +
            '```\n' +
            privateKey +
            '\n```\n\n' +
            '⚠️ *IMPORTANT*\n' +
            '• Save this key securely\n' +
            '• Never share it with anyone\n' +
            '• Import it into your preferred wallet\n\n' +
            'This message will be automatically deleted in 60 seconds\\!',
          {
            parse_mode: 'MarkdownV2',
            reply_markup: {
              inline_keyboard: [tgDeleteButton],
            },
          }
        )

        // Delete message after 60 seconds
        setTimeout(async () => {
          try {
            await ctx.deleteMessage(message.message_id)
          } catch (error) {
            appLogger.error('Error deleting export message:', error)
          }
        }, 60000)
        break
      }

      case 'cancel_export': {
        await ctx.answerCbQuery('Export cancelled')
        await ctx.reply('Wallet export cancelled', {
          reply_markup: {
            inline_keyboard: [tgDeleteButton],
          },
        })
        break
      }

      default:
        await ctx.answerCbQuery('Unknown action')
    }
  } catch (error: any) {
    appLogger.error('Error in wallet callback:', error)
    await ctx.answerCbQuery('Error: ' + (error.message || 'Unknown error'))
  }
}
