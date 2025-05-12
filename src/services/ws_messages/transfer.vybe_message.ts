import { VybeTransferSocketMessage } from '@/types'
import { bot, vybeApi } from '@/utils/platform'
import { prisma } from '@/utils/prisma.helper'
import { formatLongNumber } from '@/utils/string'

export const handleTransferMessages = (message: VybeTransferSocketMessage) => {
  // Handle transfer messages
  subscriptions(message).catch((error) => {
    console.error('Error in transfer message handler:', error)
  })
}

const subscriptions = async (message: VybeTransferSocketMessage) => {
  try {
    // Batch fetch all subscriptions at once
    const subscriptions = await prisma.subscription.findMany({
      where: {
        address_type: 'Wallet',
        address: {
          in: [message?.senderAddress, message?.receiverAddress].filter(
            Boolean
          ),
        },
      },
    })
    // console.log('subscriptions', subscriptions)

    if (subscriptions.length === 0) return

    // Fetch token details once for all subscriptions
    const token_details_req = await vybeApi.get_token_details({
      mintAddress: message?.mintAddress,
    })
    const token_details = token_details_req.data
    const amount = formatLongNumber(message.amount)
    const price = formatLongNumber(token_details?.price * message.amount)

    // Process all subscriptions
    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          const chatId = subscription.chat_id
          const action =
            message.receiverAddress === subscription?.address
              ? 'Receiver'
              : 'Sender'
          const action_receiver =
            action === 'Receiver'
              ? message?.receiverAddress
              : message?.senderAddress

          const messageText = `Transfer Alert 🚨
├ 🟣*${token_details.name || 'Unknown'} (${token_details.symbol || 'Unknown'})*
├ amount: ${amount}
price (USD): $${price}
├ action: ${action}
├ ${action} address: ${action_receiver}`

          await bot.telegram.sendPhoto(chatId, token_details?.logoUrl || '', {
            caption: messageText,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Unsubscribe', callback_data: 'unsubscibe' }],
              ],
            },
          })

          // Add small delay between messages to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          console.error(
            `Error processing subscription for chat ${subscription.chat_id}:`,
            error
          )
        }
      })
    )
  } catch (error) {
    console.error('Error in subscriptions handler:', error)
    throw error
  }
}
