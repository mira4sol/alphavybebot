import { TokenCallModel } from '@/models/token-call.model'
import { TelegramUpdate } from '@/types'
import { sendTgTokenDetailsMessage } from '../constants/tg-message.constant'
import { bot, vybeApi } from '../platform'

export const tokenResponse = {
  async tokenDetails(payload: TelegramUpdate) {
    const chat_id = payload?.message?.chat?.id?.toString() || ''
    const mint_address = payload?.message?.text
    const from = payload?.message?.from
    const isGroup =
      payload?.message?.chat?.type === 'group' ||
      payload?.message?.chat?.type === 'supergroup'

    const tokenDetails = await vybeApi.get_token_details({
      mintAddress: mint_address,
    })

    const firstCaller = isGroup
      ? await TokenCallModel.insertOrGetFirstCaller({
          chat_id,
          username: from?.username || from?.first_name || '',
          telegram_id: from?.id?.toString(),
          mint_address,
          price: tokenDetails?.data?.price,
          market_cap: tokenDetails?.data?.marketCap,
        })
      : undefined

    return await bot.telegram.sendPhoto(
      chat_id,
      tokenDetails?.data?.logoUrl || '',
      {
        caption: sendTgTokenDetailsMessage(tokenDetails.data, firstCaller),
        parse_mode: 'Markdown',
        reply_parameters: { message_id: payload?.message?.message_id },
      }
    )
  },
}
