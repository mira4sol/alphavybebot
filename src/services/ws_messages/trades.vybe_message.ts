import { VybeTradesSocketMessage } from '@/types'
import { appLogger } from '@/utils/logger.util'
import { bot, vybeApi } from '@/utils/platform'
import { prisma } from '@/utils/prisma.helper'
import { formatDecimalPrice } from '@/utils/string'

export const handleTradesMessages = async (
  message: VybeTradesSocketMessage
) => {
  try {
    // Handle trade messages
    console.log('Trade message:', message)

    // await subscriptions(message)
  } catch (error) {
    appLogger.error('[ws:trade] error', error)
  }
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
