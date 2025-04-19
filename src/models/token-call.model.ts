import { appLogger } from '@/utils/logger.util'
import { prisma } from '@/utils/prisma.helper'
import { TokenCall } from '@prisma/client'
import { LeaderboardModel } from './leaderboard.model'

export class TokenCallModel {
  static async insertOrGetFirstCaller(param: {
    telegram_id: string // Changed from number
    username: string
    chat_id: string
    mint_address: string
    price: number
    market_cap: number
  }): Promise<TokenCall> {
    try {
      // First check if this mint_address already has a call
      const existingCall = await prisma.tokenCall.findFirst({
        where: {
          mint_address: param.mint_address,
          chat_id: param.chat_id,
        },
      })

      // If call already exists for this token, return null
      if (existingCall) {
        return existingCall
      }

      await LeaderboardModel.addOrUpdateLeaderboard({
        chat_id: param.chat_id,
        telegram_id: param.telegram_id,
        data: {
          points: { increment: 1 },
        },
      })

      // If no existing call, create new one
      const tokenCall = await prisma.tokenCall.create({
        data: {
          telegram_id: param.telegram_id,
          chat_id: param.chat_id,
          mint_address: param.mint_address,
          price: param.price,
          market_cap: param.market_cap,
          username: param.username,
        },
      })

      return tokenCall
    } catch (error) {
      appLogger.error('Error fetching first caller: ', error)
      throw new Error('Error fetching first caller: ' + error)
    }
  }

  static async getChatTopCaller(chat_id?: string) {
    try {
      return await prisma.tokenCall.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        where: { ...(chat_id && { chat_id }) },
      })
    } catch (error) {
      appLogger.error('Error fetching group recent calls: ', error)
      throw new Error('Error fetching group recent calls: ' + error)
    }
  }
}
