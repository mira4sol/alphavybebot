import { WalletModel } from '@/models/wallet.model'
import { TelegrafCallbackContext } from '@/types/telegram.interface'
import { jupiterRequests } from '@/utils/api_requests/jupiter.request'
import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { connection } from '@/utils/solana.lib'
import { Keypair } from '@solana/web3.js'

export const tradingCallbackHandler = async (ctx: TelegrafCallbackContext) => {
  const callbackData = ctx.match[1] // Extract the specific action from the callback_data
  const telegramId = ctx.from?.id.toString()
  console.log('callback called')
  if (!telegramId) {
    return await ctx.answerCbQuery('Error: User ID not found')
  }

  try {
    switch (callbackData) {
      case 'buy_buttons_config':
        await ctx.answerCbQuery('Buy buttons configuration')
        break

      case 'trade_swap':
        await ctx.answerCbQuery('Swap action')
        break

      case 'buy_x': {
        // Handle custom amount input
        const mintAddress = ctx.match[2]
        if (!mintAddress) throw new Error('Token address not found')

        ctx.session = {
          ...ctx.session,
          waitingForInput: 'custom_buy_amount',
          originalMessageId: ctx.callbackQuery?.message?.message_id,
          mintAddress: mintAddress,
        }
        await ctx.answerCbQuery('Please enter the amount of SOL to buy')
        await ctx.reply('Please enter the amount of SOL to buy (e.g., 0.5)')
        break
      }

      default: {
        // Handle specific amount buys (e.g., trading:buy_0.5_mintAddress)
        if (callbackData.startsWith('buy_')) {
          const [_, amount, mintAddress] = callbackData.split('_')
          if (!amount || !mintAddress) throw new Error('Invalid buy parameters')

          const buyAmount = parseFloat(amount)
          if (isNaN(buyAmount) || buyAmount <= 0) {
            throw new Error('Invalid buy amount')
          }

          // Get user's wallet
          const wallet = await WalletModel.findWallet(telegramId)
          if (!wallet) throw new Error('Wallet not found')

          // Decrypt private key
          const privateKeyHex = await WalletModel.decryptWalletKey(telegramId)
          const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex')
          const keypair = Keypair.fromSecretKey(privateKeyBuffer)

          // Get SOL balance
          const balance = await connection.getBalance(keypair.publicKey)
          const buyAmountLamports = buyAmount * 1e9 // Convert SOL to lamports

          if (balance < buyAmountLamports) {
            throw new Error('Insufficient balance')
          }

          // Get quote from Jupiter
          const quoteResponse = await jupiterRequests.quoteResponse({
            amount: buyAmountLamports.toString(),
            inputMint: 'So11111111111111111111111111111111111111112', // SOL mint address
            outputMint: mintAddress,
          })

          if (!quoteResponse.success) {
            throw new Error(quoteResponse.message || 'Unable to get quote')
          }

          // Get swap response
          const swapResponse = await jupiterRequests.swapResponse({
            quoteResponse: quoteResponse.data,
            userPublicKey: keypair.publicKey.toString(),
            dynamicComputeUnitLimit: true,
            dynamicSlippage: true,
          })

          if (!swapResponse.success) {
            throw new Error(swapResponse.message || 'Unable to create swap')
          }

          // Send transaction
          await jupiterRequests.sendTransaction(swapResponse.data, keypair)

          await ctx.answerCbQuery('Transaction successful!')
          await ctx.reply('✅ Buy transaction successful!', {
            reply_markup: {
              inline_keyboard: [tgDeleteButton],
            },
          })
        } else {
          await ctx.answerCbQuery('Unknown action')
        }
      }
    }
  } catch (error: any) {
    console.error('Error in trading callback:', error)
    const errorMessage = error.message || 'Unknown error'
    await ctx.answerCbQuery('Error: ' + errorMessage)
    await ctx.reply('❌ ' + errorMessage, {
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
  }
}
