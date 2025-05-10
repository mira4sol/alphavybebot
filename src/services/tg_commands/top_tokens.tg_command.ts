import { CoinGeckoMarketData } from '@/types'
import { coinGeckoRequests } from '@/utils/api_requests/coingecko.request'
import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { getBotLink } from '@/utils/links.util'
import { appLogger } from '@/utils/logger.util'
import { formatLongNumber } from '@/utils/string'
import { escapeTelegramChar } from '@/utils/telegram.helpers'
import { Context } from 'telegraf'

const LOG_NAME = '[TrendingCommand::Message]'

export const topTokensCommand = async (ctx: Context, solOnly?: boolean) => {
  let deleteMessageId = 0
  try {
    deleteMessageId = (
      await ctx.reply(
        solOnly
          ? '⏳ Fetching top Solana tokens...'
          : '⏳ Fetching top global tokens...',
        {
          reply_parameters: { message_id: ctx?.msgId || 0 },
        }
      )
    )?.message_id

    const topTokensResp = await coinGeckoRequests.getTopCoins(solOnly)
    if (!topTokensResp.success) throw new Error(topTokensResp.message)

    const topTokensData = topTokensResp.data as CoinGeckoMarketData[]

    console.log('topTokensData', topTokensData)

    const tokensText = topTokensData
      .map((token) => {
        const analyzeButton = solOnly
          ? `\n>└ [Analyze with vybe](${getBotLink}?start=trade_${token.id})`
          : ''

        return `>🟣 ${escapeTelegramChar(token.name)} \\($${escapeTelegramChar(
          token.symbol.toUpperCase()
        )}\\)
>├ Rank: \\#${token.market_cap_rank}
>├ Price: $${formatLongNumber(
          token.current_price,
          true
        )} \\(${escapeTelegramChar(
          token.price_change_percentage_24h > 0
            ? `+${token.price_change_percentage_24h.toFixed(2)}`
            : token.price_change_percentage_24h.toFixed(2)
        )}%\\)
>├ Market Cap: $${formatLongNumber(token.market_cap, true)}
>├ ATH: $${formatLongNumber(token.ath, true)}`
      })
      .join('\n>\n')

    const headerText = solOnly ? '🔝 Top SOL Tokens' : '🔝 Top Tokens'
    const messageText = `${headerText}\n\n${tokensText}`

    await ctx.reply(messageText, {
      parse_mode: 'MarkdownV2',
      link_preview_options: { is_disabled: true },
      reply_parameters: { message_id: ctx?.msgId || 0 },
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
  } catch (error: any) {
    appLogger.error(`[${LOG_NAME} ${error.message}]`)
    const msg =
      error?.data?.message || error?.message || 'Unable to fetch trend'
    await ctx.reply('❌ Oh chim 🥹\n' + msg, {
      reply_parameters: { message_id: ctx?.msgId || 0 },
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
  } finally {
    if (deleteMessageId) {
      await ctx.deleteMessage(deleteMessageId)
    }
  }
}
