import { TransactionsModel } from '@/models/transaction.model'
import { VybeTradesSocketMessage } from '@/types'
import { appLogger } from '@/utils/logger.util'
import { bot, vybeApi } from '@/utils/platform'
import { prisma } from '@/utils/prisma.helper'
import { SOLANA_ADDRESSES_ARR } from '@/utils/solana.lib'
import { formatDecimalPrice } from '@/utils/string'

export const handleTradesMessages = async (
  message: VybeTradesSocketMessage
) => {
  // console.log('Trades message:', message)
  try {
    if (!SOLANA_ADDRESSES_ARR.includes(message.quoteMintAddress)) {
      await upsertTokenMint(message)
    }

    // await subscriptions(message)
  } catch (error) {
    appLogger.error('[ws:trade] error', error)
  }
}

const upsertTokenMint = async (message: VybeTradesSocketMessage) => {
  // console.log('tokenDetails', tokenDetails)
  // await TokenMintModel.upsert({
  //   mint_address: message.quoteMintAddress,
  //   name: tokenDetails.name,
  //   symbol: tokenDetails.symbol,
  //   image: tokenDetails.logoUrl,
  //   supply: tokenDetails.currentSupply,
  //   decimals: tokenDetails.decimal,
  //   price: tokenDetails.price,
  //   price1d: tokenDetails.price1d,
  //   price7d: tokenDetails.price7d,
  //   market_cap: tokenDetails.marketCap,
  //   category: tokenDetails.category,
  //   subcategory: tokenDetails.subcategory,
  //   verified: tokenDetails.verified,
  //   updateTime: tokenDetails.updateTime,
  //   currentSupply: tokenDetails.currentSupply,
  //   tokenAmountVolume24h: tokenDetails.tokenAmountVolume24h,
  //   usdValueVolume24h: tokenDetails.usdValueVolume24h,
  // })

  // console.log('TokenMintModel.upsert')
  await TransactionsModel.insert({
    base_mint: message.baseMintAddress,
    quote_mint: message.quoteMintAddress,
    base_size: message.baseSize,
    quote_size: message.quoteSize,
    fee: message.fee,
    fee_payer: message.feePayer,
    market_id: message.marketId,
    price: parseFloat(message.price),
    program_id: message.programId,
    authority_address: message.authorityAddress,
    block_time: message.blockTime,
    iix_ordinal: message.iixOrdinal,
    inter_ix_ordinal: message.interIxOrdinal,
    ix_ordinal: message.ixOrdinal,
    signature: message.signature,
    slot: message.slot,
    tx_index: message.txIndex,
  })
}

const subscriptions = async (message: VybeTradesSocketMessage) => {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      address_type: 'Mint',
      address: message?.baseMintAddress || message?.quoteMintAddress,
    },
  })

  for (const subscription of subscriptions) {
    const chatId = subscription.chat_id

    const token_details_req = await vybeApi.get_token_details({
      mintAddress: subscription.address,
    })
    const token_details = token_details_req.data
    const isBuy = message?.quoteMintAddress === subscription.address
    const size =
      message?.quoteMintAddress === subscription.address
        ? message?.quoteSize
        : message?.baseSize
    const price = formatDecimalPrice(message?.price || 0)

    const messageText = `Trade Alert 🚨
├ 🟣*${token_details.name || 'Unknown'} (${token_details.symbol || 'Unknown'})*
├ amount: ${size}
├ price: $${price}
└ trade type: ${isBuy ? 'BOUGHT' : 'SOLD'}`

    bot.telegram.sendPhoto(chatId, token_details?.logoUrl || '', {
      caption: messageText,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Unsubscribe', callback_data: 'unsubscibe' }],
        ],
      },
    })
  }
}
