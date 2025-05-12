import { appLogger } from '@/utils/logger.util'
import { vybeApi } from '@/utils/platform'
import { prisma } from '@/utils/prisma.helper'
import { SOLANA_ADDRESSES_ARR } from '@/utils/solana.lib'
import fs from 'fs'
import path from 'path'

const TOP_TOKENS_FILE = path.join(process.cwd(), 'data', 'top_tokens.json')
const TOP_TOKENS_TEMP_FILE = path.join(
  process.cwd(),
  'data',
  'top_tokens.temp.json'
)

// Ensure data directory exists
if (!fs.existsSync(path.dirname(TOP_TOKENS_FILE))) {
  fs.mkdirSync(path.dirname(TOP_TOKENS_FILE), { recursive: true })
}

export const fetchTopTokens = async () => {
  try {
    // Get transactions from the last 5 minutes where base_mint is a native mint
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const tokenDetails = []
    let skip = 0
    const BATCH_SIZE = 15
    const TARGET_TOKENS = 10

    while (tokenDetails.length < TARGET_TOKENS) {
      console.log('fetching transactions batch', skip)
      const transactions = await prisma.transaction.findMany({
        where: {
          created_at: {
            gte: fiveMinutesAgo,
          },
          base_mint: {
            in: SOLANA_ADDRESSES_ARR,
          },
        },
        orderBy: {
          quote_size: 'desc',
        },
        take: BATCH_SIZE,
        skip: skip,
        distinct: ['quote_mint'],
      })

      if (transactions.length === 0) {
        console.log('No more transactions to process')
        break
      }

      // console.log('transactions batch', transactions)

      // Fetch token details for each unique quote mint
      for (const tx of transactions) {
        try {
          // Add delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 200))

          try {
            // console.log('fetching token details', tx.quote_mint)
            const details = await vybeApi.get_token_details({
              mintAddress: tx.quote_mint,
            })

            // console.log('fetched token details', details.data)
            tokenDetails.push({
              mint_address: tx.quote_mint,
              ...details.data,
            })

            // If we have enough tokens, break out of the loop
            if (tokenDetails.length >= TARGET_TOKENS) {
              break
            }
          } catch (tokenError) {
            appLogger.error(
              `Error fetching details for token ${tx.quote_mint}:`,
              tokenError
            )
            // Continue to next token
            continue
          }
        } catch (error) {
          appLogger.error(
            `Error processing transaction ${tx.quote_mint}:`,
            error
          )
        }
      }

      // If we have enough tokens, break out of the while loop
      if (tokenDetails.length >= TARGET_TOKENS) {
        break
      }

      // Increment skip for next batch
      skip += BATCH_SIZE
    }

    // Write to temporary file first
    if (tokenDetails.length > 0) {
      fs.writeFileSync(
        TOP_TOKENS_TEMP_FILE,
        JSON.stringify(tokenDetails, null, 2)
      )

      // Then rename to final file
      fs.renameSync(TOP_TOKENS_TEMP_FILE, TOP_TOKENS_FILE)

      appLogger.info(
        `Updated top tokens data with ${tokenDetails.length} tokens`
      )
    } else {
      appLogger.info('No new token details to update')
    }
  } catch (error) {
    appLogger.error('Error in fetchTopTokens cron:', error)
    // Clean up temp file if it exists
    if (fs.existsSync(TOP_TOKENS_TEMP_FILE)) {
      fs.unlinkSync(TOP_TOKENS_TEMP_FILE)
    }
  }
}
