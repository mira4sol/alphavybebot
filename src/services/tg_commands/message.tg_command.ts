import { SettingsModel } from '@/models/settings.mode'
import { WalletModel } from '@/models/wallet.model'
import { TelegrafContext } from '@/types/telegram.interface'
import { jupiterRequests } from '@/utils/api_requests/jupiter.request'
import { tgDeleteButton } from '@/utils/constants/tg.constants'
import {
  connection,
  isMintAddress,
  isValidSolanaAddress,
} from '@/utils/solana.lib'
import { tokenResponse } from '@/utils/tg_response/token.response'
import { settingsCommand } from './settings.tg_command'
import { walletAlertCommand } from './walllet_alert.tg_command'

const LOG_NAME = '[MessageCommand::Message]'

export const messageCommand = async (ctx: TelegrafContext) => {
  try {
    // Check if we're waiting for settings input
    if (ctx.session?.waitingForInput) {
      const telegramId = ctx.from?.id.toString()
      if (!telegramId) {
        throw new Error('User ID not found')
      }

      const input = ctx.text || ''

      switch (ctx.session.waitingForInput) {
        case 'buy_token': {
          if (!isMintAddress(input)) {
            throw new Error('Please enter a valid token address')
          }

          // Get user's wallet
          const wallet = await WalletModel.findWalletByTelegramId(telegramId)
          if (!wallet) throw new Error('Wallet not found')

          // Decrypt private key
          const keypair = await WalletModel.decryptWalletKey(telegramId)
          // const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex')
          // const keypair = Keypair.fromSecretKey(privateKeyBuffer)

          // Get SOL balance
          const balance = await connection.getBalance(keypair.publicKey)
          const buyAmountLamports = 0.1 * 1e9 // Default to 0.1 SOL

          if (balance < buyAmountLamports) {
            throw new Error('Insufficient balance')
          }

          // Get quote from Jupiter
          const quoteResponse = await jupiterRequests.quoteResponse({
            amount: buyAmountLamports,
            inputMint: 'So11111111111111111111111111111111111111112', // SOL mint address
            outputMint: input,
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

          await ctx.reply('✅ Buy transaction successful!', {
            reply_markup: {
              inline_keyboard: [tgDeleteButton],
            },
          })
          break
        }
        case 'track_wallet': {
          if (!isValidSolanaAddress(input)) {
            throw new Error('Please enter a valid wallet address')
          }
          await walletAlertCommand(ctx, 'Wallet', input)
          break
        }
        case 'auto_buy_amount_sol':
        case 'left_buy_amount_sol':
        case 'right_buy_amount_sol':
        case 'sell_partial_percentage':
        case 'sell_full_percentage':
        case 'custom_buy_amount': {
          const numInput = parseFloat(input)
          if (isNaN(numInput)) {
            throw new Error('Please enter a valid number')
          }

          let updateData: any = {}
          switch (ctx.session.waitingForInput) {
            case 'auto_buy_amount_sol':
              if (numInput <= 0)
                throw new Error('Amount must be greater than 0')
              updateData.auto_buy_amount_sol = numInput
              break
            case 'left_buy_amount_sol':
              if (numInput <= 0)
                throw new Error('Amount must be greater than 0')
              updateData.buy_amount_sol = numInput
              break
            case 'right_buy_amount_sol':
              if (numInput <= 0)
                throw new Error('Amount must be greater than 0')
              updateData.max_buy_amount_sol = numInput
              break
            case 'sell_partial_percentage':
              if (numInput <= 0 || numInput > 100)
                throw new Error('Percentage must be between 0 and 100')
              updateData.sell_partial_percentage = numInput
              break
            case 'sell_full_percentage':
              if (numInput <= 0 || numInput > 100)
                throw new Error('Percentage must be between 0 and 100')
              updateData.sell_full_percentage = numInput
              break
            case 'custom_buy_amount': {
              if (numInput <= 0)
                throw new Error('Amount must be greater than 0')
              const mintAddress = ctx.session.mintAddress
              if (!mintAddress) throw new Error('Token address not found')

              // Get user's wallet
              const wallet = await WalletModel.findWalletByTelegramId(
                telegramId
              )
              if (!wallet) throw new Error('Wallet not found')

              // Decrypt private key
              const keypair = await WalletModel.decryptWalletKey(telegramId)
              // const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex')
              // const keypair = Keypair.fromSecretKey(privateKeyBuffer)

              // Get SOL balance
              const balance = await connection.getBalance(keypair.publicKey)
              const buyAmountLamports = numInput * 1e9 // Convert SOL to lamports

              if (balance < buyAmountLamports) {
                throw new Error('Insufficient balance')
              }

              // Get quote from Jupiter
              const quoteResponse = await jupiterRequests.quoteResponse({
                amount: buyAmountLamports,
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

              await ctx.reply('✅ Buy transaction successful!', {
                reply_markup: {
                  inline_keyboard: [tgDeleteButton],
                },
              })
              break
            }
          }

          // Update settings if needed
          if (Object.keys(updateData).length > 0) {
            await SettingsModel.updateUserSettings(telegramId, updateData)
          }

          // Refresh settings message if it was a settings update
          if (Object.keys(updateData).length > 0) {
            await settingsCommand(ctx)
          }
          break
        }
      }

      // Clear the session
      ctx.session = {
        ...ctx.session,
        waitingForInput: undefined,
        originalMessageId: undefined,
        mintAddress: undefined,
      }
      return
    }

    // Handle token address input
    if (isMintAddress(ctx.state?.mint || ctx?.text || '')) {
      console.log('mint', ctx.state.mint)
      return await tokenResponse.tokenDetails(ctx)
    }
  } catch (error: any) {
    const msg = error?.data?.message || error?.message || 'Unknown error'
    await ctx.reply('❌ Oh chim 🥹\n' + msg, {
      reply_parameters: { message_id: ctx?.msgId || 0 },
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
  }
}
