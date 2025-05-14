import { TelegrafCallbackContext } from '@/types/telegram.interface'
import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { appLogger } from '@/utils/logger.util'
import { settingsCommand } from '../tg_commands/settings.tg_command'
import { topTokensCommand } from '../tg_commands/top_tokens.tg_command'
import { trendingCommand } from '../tg_commands/trending.tg_command'
import { walletCommand } from '../tg_commands/wallet.tg_command'

export const menuCallbackHandler = async (ctx: TelegrafCallbackContext) => {
  try {
    const action = ctx.match[1]
    const telegramId = ctx.from?.id.toString()

    if (!telegramId) {
      throw new Error('User ID not found')
    }

    switch (action) {
      case 'view_wallet':
        await walletCommand(ctx)
        break
      case 'buy_token':
        // Set session to wait for token address input
        ctx.session = {
          ...ctx.session,
          waitingForInput: 'buy_token',
          originalMessageId: ctx.callbackQuery?.message?.message_id,
        }
        await ctx.reply('Please enter the token address you want to buy:', {
          reply_markup: {
            inline_keyboard: [tgDeleteButton],
          },
        })
        break
      case 'settings':
        await settingsCommand(ctx)
        break
      case 'share':
        await ctx.reply(
          'Share Vybe Bot with your friends!\n\n' + 'https://t.me/AlphaVybeBot',
          {
            reply_markup: {
              inline_keyboard: [tgDeleteButton],
            },
          }
        )
        break
      case 'track_wallet':
        // Set session to wait for wallet address input
        ctx.session = {
          ...ctx.session,
          waitingForInput: 'track_wallet',
          originalMessageId: ctx.callbackQuery?.message?.message_id,
        }
        await ctx.reply('Please enter the wallet address you want to track:', {
          reply_markup: {
            inline_keyboard: [tgDeleteButton],
          },
        })
        break
      case 'tracked_wallets':
        // TODO: Implement tracked wallets view
        await ctx.reply('Tracked wallets feature coming soon!', {
          reply_markup: {
            inline_keyboard: [tgDeleteButton],
          },
        })
        break
      case 'trending':
        await trendingCommand(ctx)
        break
      case 'top_solana':
        await topTokensCommand(ctx, true)
        break
      case 'top_global':
        await topTokensCommand(ctx, false)
        break
      default:
        throw new Error('Invalid menu action')
    }
  } catch (error: any) {
    appLogger.error('Error in menu callback: ', error)
    const msg =
      error?.data?.message || error?.message || 'Unable to process menu action'
    await ctx.reply(msg, {
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
  }
}
