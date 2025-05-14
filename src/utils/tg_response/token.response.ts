import { SettingsModel } from '@/models/settings.mode'
import { TokenCallModel } from '@/models/token-call.model'
import { RugResponse } from '@/types/rug.interface'
import { Context } from 'telegraf'
import { rugRequests } from '../api_requests/rug.request'
import { sendTgTokenDetailsMessage } from '../constants/tg-message.constant'
import { tgDeleteButton } from '../constants/tg.constants'
import { getBotLink } from '../links.util'
import { bot, vybeApi } from '../platform'

export const tokenResponse = {
  async tokenDetails(ctx: Context) {
    const chat_id = ctx?.message?.chat?.id?.toString() || ''

    let deleteId = (
      await bot.telegram.sendMessage(chat_id, '⏳ Fetching token details...', {
        reply_parameters: { message_id: ctx?.msgId || 0 },
      })
    )?.message_id
    await ctx.sendChatAction('typing')

    try {
      const mint_address = ctx.state?.mint || ctx?.text || ''
      console.log('mint_address', mint_address)
      const from = ctx?.message?.from
      const isGroup =
        ctx?.chat?.type === 'group' || ctx?.chat?.type === 'supergroup'

      const tokenDetails = await vybeApi.get_token_details({
        mintAddress: mint_address,
      })

      const rugReq = await rugRequests.getTokenReport(
        tokenDetails?.data?.mintAddress
      )

      // if (!rugReq.success) throw new Error(rugReq.message)

      const rugData = rugReq.data ? (rugReq.data as RugResponse) : undefined

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

      const settings = await SettingsModel.findUserSettings(
        ctx.from?.id?.toString() || ''
      )

      return await ctx.replyWithPhoto(
        tokenDetails?.data?.logoUrl || rugData?.fileMeta?.image || '',
        {
          caption: sendTgTokenDetailsMessage(
            tokenDetails.data,
            firstCaller,
            rugData
          ),
          parse_mode: 'Markdown',
          reply_parameters: { message_id: ctx?.msgId || 0 },
          reply_markup: {
            inline_keyboard: [
              [
                ...(isGroup
                  ? [
                      {
                        text: 'Trade',
                        url:
                          getBotLink +
                          '?start=trade_' +
                          tokenDetails.data?.mintAddress,
                      },
                    ]
                  : []),
                {
                  text: 'Vybe FYI',
                  url: `https://vybe.fyi/tokens/${tokenDetails.data?.mintAddress}`,
                },
              ],
              ...(!isGroup
                ? [
                    [
                      {
                        text: '--- BUY ---',
                        callback_data: 'trading:buy_buttons_config',
                      },
                    ],
                    [
                      {
                        text: '✅ SWAP',
                        callback_data: 'trading:trade_swap',
                      },
                    ],
                    [
                      {
                        text: `${settings?.buy_amount_sol} SOL`,
                        callback_data: `trading:buy_${settings?.buy_amount_sol}_${tokenDetails.data?.mintAddress}`,
                      },
                      {
                        text: `${settings?.max_buy_amount_sol} SOL`,
                        callback_data: `trading:buy_${settings?.max_buy_amount_sol}_${tokenDetails.data?.mintAddress}`,
                      },
                      {
                        text: 'X SOL ✍🏽',
                        callback_data: `trading:buy_x_${tokenDetails.data?.mintAddress}`,
                      },
                    ],
                  ]
                : []),
              tgDeleteButton,
            ],
          },
        }
      )
    } catch (error: any) {
      if (error?.data?.message === 'Query returned no results') {
        return await bot.telegram.sendMessage(chat_id, 'Unsupported token 🥹', {
          reply_parameters: { message_id: ctx?.msgId || 0 },
          reply_markup: {
            inline_keyboard: [tgDeleteButton],
          },
        })
      }
      const msg =
        error?.data?.message || error?.message || 'Unable to get chart'
      await ctx.reply(msg, {
        reply_parameters: { message_id: ctx?.msgId || 0 },
        reply_markup: {
          inline_keyboard: [tgDeleteButton],
        },
      })
    } finally {
      if (deleteId) await bot.telegram.deleteMessage(chat_id, deleteId)
    }
  },
}
