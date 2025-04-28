import {
  JupiterQuoteParams,
  JupiterSwapParams,
  JupiterSwapResponse,
} from '@/types'
import { Keypair, VersionedTransaction } from '@solana/web3.js'
import { apiResponse, httpRequest } from '../api.helpers'
import { connection } from '../solana.lib'

export const jupiterRequests = {
  quoteResponse: async ({
    amount,
    inputMint,
    outputMint,
  }: JupiterQuoteParams) => {
    try {
      const url = `https://lite-api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount={amount}&slippageBps=50&restrictIntermediateTokens=true`
      const res = await httpRequest().get(url)

      return apiResponse(true, 'qoute response', res.data)
    } catch (err: any) {
      console.log('Error swap data:', err?.response?.data)
      return apiResponse(
        false,
        err?.response?.data?.message || err?.message || 'Error occurred.',
        err
      )
    }
  },
  swapResponse: async ({
    quoteResponse,
    userPublicKey,
    dynamicComputeUnitLimit,
    dynamicSlippage,
    prioritizationFeeLamports,
  }: JupiterSwapParams) => {
    try {
      const url = `https://lite-api.jup.ag/swap/v1/swap`
      const res = await httpRequest().post(url, {
        quoteResponse,
        userPublicKey,
        dynamicComputeUnitLimit, // Estimate compute units dynamically
        dynamicSlippage, // Estimate slippage dynamically
        // Priority fee optimization
        prioritizationFeeLamports: {
          // priorityLevelWithMaxLamports: {
          //   maxLamports: 1000000, // Cap fee at 0.001 SOL
          //   global: false, // Use local fee market for better estimation
          //   priorityLevel: 'medium', // veryHigh === 75th percentile for better landing
          // },
        },
      } as JupiterSwapParams)

      return apiResponse(true, 'swap response', res.data)
    } catch (err: any) {
      console.log('Error swap data:', err?.response?.data)
      return apiResponse(
        false,
        err?.response?.data?.message || err?.message || 'Error occurred.',
        err
      )
    }
  },
  sendTransaction: async (
    swapResponse: JupiterSwapResponse,
    keyPair: Keypair
  ) => {
    try {
      const transactionBase64 = swapResponse.swapTransaction
      const transaction = VersionedTransaction.deserialize(
        Buffer.from(transactionBase64, 'base64')
      )
      console.log(transaction)

      transaction.sign([keyPair])

      const transactionBinary = transaction.serialize()
      console.log(transactionBinary)

      const signature = await connection.sendRawTransaction(transactionBinary, {
        maxRetries: 2,
        skipPreflight: true,
      })
      const confirmation = await connection.confirmTransaction(
        signature,
        'finalized'
      )

      if (confirmation.value.err) {
        throw new Error(
          `Transaction failed: ${JSON.stringify(
            confirmation.value.err
          )}\nhttps://solscan.io/tx/${signature}/`
        )
      } else
        console.log(
          `Transaction successful: https://solscan.io/tx/${signature}/`
        )
    } catch (err: any) {
      console.log('Error swap data:', err?.response?.data)
      return apiResponse(
        false,
        err?.response?.data?.message || err?.message || 'Error occurred.',
        err
      )
    }
  },
}
