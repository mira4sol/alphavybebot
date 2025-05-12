import { appLogger } from '@/utils/logger.util'
import { prisma } from '@/utils/prisma.helper'

export class TransactionsModel {
  static async insert(data: {
    base_mint: string
    quote_mint: string
    base_size: string
    quote_size: string
    fee: string
    fee_payer: string
    market_id: string
    price: number
    program_id: string
    // Raw VybeTradesSocketMessage data
    authority_address?: string
    block_time?: number
    iix_ordinal?: number
    inter_ix_ordinal?: number
    ix_ordinal?: number
    signature?: string
    slot?: number
    tx_index?: number
  }) {
    try {
      const transaction = await prisma.transaction.create({ data })
      // console.log('transaction created', transaction)
      return transaction
    } catch (error: any) {
      appLogger.error('transaction db error', error)
    }
  }
}
