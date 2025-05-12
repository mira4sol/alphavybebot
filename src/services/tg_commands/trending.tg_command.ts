import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { appLogger } from '@/utils/logger.util'
import { formatLongNumber } from '@/utils/string'
import { escapeTelegramChar } from '@/utils/telegram.helpers'
import fs from 'fs'
import path from 'path'
import { Context } from 'telegraf'

const LOG_NAME = '[TrendingCommand::Message]'
const TOP_TOKENS_FILE = path.join(process.cwd(), 'data', 'top_tokens.json')

interface TokenData {
  name: string
  symbol: string
  price: number
  marketCap: number
  usdValueVolume24h: number
  currentSupply: number
  verified: boolean
}

export const trendingCommand = async (ctx: Context) => {
  let deleteMessageId = 0
  try {
    deleteMessageId = (
      await ctx.reply('⏳ Fetching trending tokens...', {
        reply_parameters: { message_id: ctx?.msgId || 0 },
      })
    )?.message_id

    // Read and parse the top tokens file
    const fileContent = fs.readFileSync(TOP_TOKENS_FILE, 'utf-8')
    const tokens = JSON.parse(fileContent).slice(0, 10) as TokenData[] // Get only first 10 items

    const tokensText = tokens
      .map((token: TokenData) => {
        return `>🟣 ${escapeTelegramChar(token.name)} \\($${escapeTelegramChar(
          token.symbol.toUpperCase()
        )}\\)
>├ Price: $${formatLongNumber(token.price, true)}
>├ Market Cap: $${formatLongNumber(token.marketCap, true)}
>├ 24h Volume: $${formatLongNumber(token.usdValueVolume24h, true)}
>├ Supply: ${formatLongNumber(token.currentSupply, true)}
>└ Verified: ${token.verified ? '✅' : '❌'}`
      })
      .join('\n>\n')

    const messageText = `🔥 Trending Tokens\n\n${tokensText}`

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
      error?.data?.message ||
      error?.message ||
      'Unable to fetch trending tokens'
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
