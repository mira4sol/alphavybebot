import { TokenCallModel } from '@/models/token-call.model'
import { Context } from 'telegraf'
import { sendTgTokenDetailsMessage } from '../constants/tg-message.constant'
import { tgDeleteButton } from '../constants/tg.constants'
import { bot, vybeApi } from '../platform'

export const tokenResponse = {
  async tokenDetails(ctx: Context) {
    const chat_id = ctx?.message?.chat?.id?.toString() || ''

    let deleteId = (
      await bot.telegram.sendMessage(chat_id, '⏳ Fetching token details...', {
        reply_parameters: { message_id: ctx?.msgId || 0 },
      })
    )?.message_id

    try {
      const mint_address = ctx?.text || ''
      const from = ctx?.message?.from
      const isGroup =
        ctx?.chat?.type === 'group' || ctx?.chat?.type === 'supergroup'

      const tokenDetails = await vybeApi.get_token_details({
        mintAddress: mint_address,
      })

      const firstCaller = isGroup
        ? await TokenCallModel.insertOrGetFirstCaller({
            chat_id,
            username: from?.username || from?.first_name || '',
            telegram_id: ctx.from?.id?.toString() || '',
            mint_address,
            price: tokenDetails?.data?.price,
            market_cap: tokenDetails?.data?.marketCap,
          })
        : undefined

      return await ctx.replyWithPhoto(tokenDetails?.data?.logoUrl || '', {
        caption: sendTgTokenDetailsMessage(tokenDetails.data, firstCaller),
        parse_mode: 'Markdown',
        reply_parameters: { message_id: ctx?.msgId || 0 },
        reply_markup: {
          inline_keyboard: [tgDeleteButton],
        },
      })
    } catch (error: any) {
      if (error?.data?.message === 'Query returned no results') {
        return await bot.telegram.sendMessage(chat_id, 'Unsupported token 🥹')
      }
    } finally {
      if (deleteId) await bot.telegram.deleteMessage(chat_id, deleteId)
    }
  },
}
