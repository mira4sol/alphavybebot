import { VybeTransferSocketMessage } from '@/types'
import { bot, vybeApi } from '@/utils/platform'
import { prisma } from '@/utils/prisma.helper'
import { SOLANA_ADDRESSES_ARR } from '@/utils/solana.lib'
import { formatDecimalPrice, formatLongNumber } from '@/utils/string'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

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
    const isSolana = SOLANA_ADDRESSES_ARR.includes(message.mintAddress)
    const amount = isSolana
      ? formatLongNumber(message.amount / LAMPORTS_PER_SOL)
      : formatLongNumber(message.amount)

    const price = isSolana
      ? formatDecimalPrice(
          token_details?.price * (message.amount / LAMPORTS_PER_SOL),
          5
        )
      : formatDecimalPrice(token_details?.price * message.amount, 5)

    // Process all subscriptions
    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          const chatId = subscription.chat_id
          const isSender = message.senderAddress === subscription.address
          const otherAddress = isSender
            ? message.receiverAddress
            : message.senderAddress
          const actionText = isSender ? 'Sent to' : 'Received from'

          const walletBalance = await vybeApi.get_wallet_tokens({
            ownerAddress: subscription.address,
            minAssetValue: '0',
            maxAssetValue: '10e20',
          })

          const messageText = `Transfer Alert 🚨
├ 🟣*${token_details.name || 'Unknown'} (${token_details.symbol || 'Unknown'})*
├ amount: ${amount}
├ price (USD): $${price}
├ ${actionText}: ${otherAddress}
└ wallet balance: $${formatLongNumber(
            parseFloat(walletBalance.data.totalTokenValueUsd)
          )}`

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
