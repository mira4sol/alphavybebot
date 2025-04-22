import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { vybeFYITokenLink, vybeFYIWalletLink } from '@/utils/links.util'
import { appLogger } from '@/utils/logger.util'
import { vybeApi } from '@/utils/platform'
import { isValidSolanaAddress } from '@/utils/solana.lib'
import { escapeMarkdown, formatDecimalPrice } from '@/utils/string'
import { Context } from 'telegraf'

const LOG_NAME = '[TelegramCommand::Message]'

export const walletCommand = async (ctx: Context) => {
  let deleteMessageId = 0

  try {
    const wallet_address = ctx.text?.split(' ')[1]

    if (!wallet_address || !isValidSolanaAddress(wallet_address?.trim())) {
      let txt = `❌ Invalid Input!
 └ Use /wallet <wallet address>, e.g. /wallet 5QDwYS1CtHzN1oJ2eij8Crka4D2eJcUavMcyuvwNRM9`

      return await ctx.reply(txt, {
        reply_parameters: { message_id: ctx?.msgId || 0 },
      })
    }

    deleteMessageId =
      (
        await ctx.reply('⏳ Fetching wallet details...', {
          reply_parameters: { message_id: ctx?.msgId || 0 },
        })
      )?.message_id || 0

    const walletReq = await vybeApi.get_wallet_tokens({
      ownerAddress: wallet_address,
      maxAssetValue: (10e10).toString(),
      minAssetValue: '0'.toString(),
      includeNoPriceBalance: false,
    })
    const wallet_balance = walletReq.data
    console.log('wallet_balance', wallet_balance)

    const tokenDetailsTxt = wallet_balance.data
      .map((item) => {
        return `>🟣 ${escapeMarkdown(item?.name || '')} \\($${escapeMarkdown(
          item?.symbol || ''
        )}\\)
>├ *Balance*: ${escapeMarkdown(formatDecimalPrice(item?.amount) || '0')}
>├ *Value in \\(USD\\)*: $${escapeMarkdown(
          formatDecimalPrice(item?.valueUsd)
        )} \\(${escapeMarkdown(item?.priceUsd1dChange)}\\)
>├ *Address*: ${item?.mintAddress}
>├ *Verified:* ${item?.verified ? '🟢' : '🔴'}
>└ ${vybeFYITokenLink('*Analyze token with vybe:* ', item?.mintAddress)}`
      })
      .join('\n>\n')

    let walletMessageText = `📊 Wallet Information
├ *Total*: $${escapeMarkdown(
      wallet_balance?.totalTokenValueUsd
    )} \\(${escapeMarkdown(
      Number(wallet_balance?.totalTokenValueUsd1dChange).toFixed(2)
    )}%\\)
├ *Staked SOL*: $${escapeMarkdown(wallet_balance?.activeStakedSolBalanceUsd)}
├ *Total token count*: ${escapeMarkdown(
      wallet_balance?.totalTokenCount?.toString() || '0'
    )}
└ ${vybeFYIWalletLink('*Analyze wallet with vybe*', wallet_address)}

📊 Token Balances
${tokenDetailsTxt}`

    return await ctx.reply(walletMessageText, {
      parse_mode: 'MarkdownV2',
      reply_parameters: { message_id: ctx?.msgId || 0 },
      link_preview_options: { is_disabled: true },
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
  } catch (error: any) {
    appLogger.error('Error fetching wallet balance: ', error)
    const msg =
      error?.data?.message || error?.message || 'Unable to fetch wallet details'
    await ctx.reply('❗️ Oh chim 🥹\n' + msg, {
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
