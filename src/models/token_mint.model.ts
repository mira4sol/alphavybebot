import { appLogger } from '@/utils/logger.util'
import { prisma } from '@/utils/prisma.helper'

export class TokenMintModel {
  static async upsert(data: {
    mint_address: string
    name?: string
    symbol?: string
    image?: string
    supply?: number
    decimals?: number
    price?: number
    price1d?: number
    price7d?: number
    market_cap?: number
    category?: string
    subcategory?: string
    verified?: boolean
    updateTime?: number
    currentSupply?: number
    tokenAmountVolume24h?: number
    usdValueVolume24h?: number
    last_trade_at?: Date
  }) {
    try {
      const tokenMint = await prisma.tokenMint.upsert({
        where: {
          mint_address: data.mint_address,
        },
        update: {
          name: data.name,
          symbol: data.symbol,
          image: data.image,
          supply: data.currentSupply
            ? Math.floor(data.currentSupply)
            : undefined,
          decimals: data.decimals,
          price: data.price,
          price1d: data.price1d,
          price7d: data.price7d,
          market_cap: data.market_cap,
          category: data.category,
          subcategory: data.subcategory,
          verified: data.verified,
          update_time: data.updateTime
            ? new Date(data.updateTime * 1000)
            : undefined,
          current_supply: data.currentSupply,
          token_amount_volume_24h: data.tokenAmountVolume24h,
          usd_value_volume_24h: data.usdValueVolume24h,
          last_trade_at: data.last_trade_at,
        },
        create: {
          mint_address: data.mint_address,
          name: data.name,
          symbol: data.symbol,
          image: data.image,
          supply: data.currentSupply
            ? Math.floor(data.currentSupply)
            : undefined,
          decimals: data.decimals ?? 9,
          price: data.price,
          price1d: data.price1d,
          price7d: data.price7d,
          market_cap: data.market_cap,
          category: data.category,
          subcategory: data.subcategory,
          verified: data.verified ?? false,
          update_time: data.updateTime
            ? new Date(data.updateTime * 1000)
            : undefined,
          current_supply: data.currentSupply,
          token_amount_volume_24h: data.tokenAmountVolume24h,
          usd_value_volume_24h: data.usdValueVolume24h,
          last_trade_at: data.last_trade_at,
        },
      })
      return tokenMint
    } catch (error: any) {
      appLogger.error('Error upserting token mint:', error)
      throw new Error('Error upserting token mint: ' + error.message)
    }
  }
}
