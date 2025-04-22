import { VybeTransferSocketMessage } from '@/types'
import { bot, vybeApi } from '@/utils/platform'
import { prisma } from '@/utils/prisma.helper'
import { formatLongNumber } from '@/utils/string'

export const handleTransferMessages = (message: VybeTransferSocketMessage) => {
  // Handle transfer messages
  console.log('Transfer message:', message)
}

const subscriptions = async (message: VybeTransferSocketMessage) => {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      address_type: 'Wallet',
      address: message?.senderAddress || message?.receiverAddress,
    },
  })

  for (const subscription of subscriptions) {
    const chatId = subscription.chat_id

    const token_details_req = await vybeApi.get_token_details({
      mintAddress: message?.mintAddress,
    })
    const token_details = token_details_req.data
    const amount = formatLongNumber(message.amount)
    const action =
      message.receiverAddress === subscription?.address ? 'Receiver' : 'Sender'
    const action_receiver =
      action === 'Receiver' ? message?.receiverAddress : message?.senderAddress
    const price = formatLongNumber(token_details?.price * message.amount)

    // └ trade type: ${isBuy ? 'BOUGHT' : 'SOLD'}`
    const messageText = `Transfer Alert 🚨
├ 🟣*${token_details.name || 'Unknown'} (${token_details.symbol || 'Unknown'})*
├ amount: ${amount}
price (USD): $${price}
├ action: ${action}
├ ${action} address: ${action_receiver}`

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
