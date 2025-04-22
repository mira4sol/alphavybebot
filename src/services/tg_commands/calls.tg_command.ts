import { TokenCallModel } from '@/models/token-call.model'
import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { vybeFYITokenLink } from '@/utils/links.util'
import { appLogger } from '@/utils/logger.util'
import { calculatePriceMultiplierWithEmoji } from '@/utils/number.helper'
import { vybeApi } from '@/utils/platform'
import { formatLongNumber } from '@/utils/string'
import { escapeTelegramChar } from '@/utils/telegram.helpers'
import { Context } from 'telegraf'

const LOG_NAME = '[CallsCommand::Message]'

export const callsCommand = async (ctx: Context) => {
  let deleteMessageId = 0

  try {
    if (ctx?.chat?.type === 'private')
      return await ctx.reply('This command can only be used in groups ⛔️', {
        reply_parameters: { message_id: ctx?.msgId || 0 },
      })

    deleteMessageId = (
      await ctx.reply('⏳ Fetching last 10 calls...', {
        reply_parameters: { message_id: ctx?.msgId || 0 },
      })
    )?.message_id

    const call = await TokenCallModel.getChatTopCaller(ctx.chat?.id?.toString())
    console.log('calls', call)

    // let tokenCallsText = ``

    let tokenCallsText = (
      await Promise.all(
        call.map(async (item) => {
          const tokenReq = await vybeApi.get_token_details({
            mintAddress: item?.mint_address,
          })
          const token = tokenReq?.data

          return `>🟣 ${escapeTelegramChar(
            token?.name || ''
          )} \\($${escapeTelegramChar(token?.symbol)}\\)
>├ Called at: $${formatLongNumber(item?.market_cap || 0, true)}
>├ Current:   $${formatLongNumber(
            token?.marketCap || 0,
            true
          )} \\(${escapeTelegramChar(
            calculatePriceMultiplierWithEmoji(
              token?.marketCap || 0,
              item?.market_cap || 0
            )
          )}\\)
>├ Caller: ${escapeTelegramChar(item?.username)}
>└ ${vybeFYITokenLink('Analyze with vybe:', item?.mint_address)}`
        })
      )
    ).join('\n>\n')

    const leaderboardTexts = tokenCallsText
      ? `☎️ Last 10 Calls
└ ${escapeTelegramChar(ctx?.chat?.title || '')}

${tokenCallsText}`
      : 'No Calls Yet'

    await ctx.reply(leaderboardTexts, {
      parse_mode: 'MarkdownV2',
      link_preview_options: { is_disabled: true },
      reply_parameters: { message_id: ctx?.msgId || 0 },
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
  } catch (error: any) {
    appLogger.error('Error fetching group calls: ', error)
    const msg =
      error?.data?.message || error?.message || 'Unable to fetch calls'
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
