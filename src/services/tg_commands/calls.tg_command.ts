import { TokenCallModel } from '@/models/token-call.model'
import { TelegramUpdate } from '@/types'
import { vybeFYITokenLink } from '@/utils/links.util'
import { appLogger } from '@/utils/logger.util'
import { calculatePriceMultiplierWithEmoji } from '@/utils/number.helper'
import { bot, vybeApi } from '@/utils/platform'
import { formatLongNumber } from '@/utils/string'
import { escapeTelegramChar } from '@/utils/telegram.helpers'

const LOG_NAME = '[CallsCommand::Message]'

export const callsCommand = async (
  chat_id: string,
  payload: TelegramUpdate
) => {
  try {
    const text = payload?.message?.text

    const call = await TokenCallModel.getChatTopCaller(chat_id)
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
└ ${escapeTelegramChar(payload?.message?.chat?.title || '')}

${tokenCallsText}`
      : 'No Calls Yet'

    await bot.telegram.sendMessage(chat_id, leaderboardTexts, {
      parse_mode: 'MarkdownV2',
      link_preview_options: { is_disabled: true },
      reply_parameters: { message_id: payload?.message?.message_id },
    })
  } catch (error: any) {
    appLogger.error('Error fetching group calls: ', error)
    await bot.telegram.sendMessage(
      chat_id,
      error?.data?.message || 'Error Occurred'
    )
  }
}
