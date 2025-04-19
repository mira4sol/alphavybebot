import { appLogger } from '@/utils/logger.util'
import { prisma } from '@/utils/prisma.helper'
import { LeaderboardEntry } from '@prisma/client'

export class LeaderboardModel {
  static async getGroupLeaderboard(chatId: string) {
    try {
      const tx = await prisma.$transaction([
        prisma.leaderboardEntry.findMany({
          where: {
            chat_id: chatId,
          },
          orderBy: {
            points: 'desc',
          },
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
          take: 10, // Top 10 users
        }),
        prisma.tokenCall.count({ where: { chat_id: chatId } }),
      ])
      const leaderboard = tx[0]
      const totalCalls = tx[1]
      return { leaderboard, totalCalls }
    } catch (error) {
      appLogger.error('Error fetching leaderboard: ', error)
      throw new Error('Error fetching leaderboard: ' + error)
    }
  }

  static async addOrUpdateLeaderboard(param: {
    telegram_id: string // Changed from number
    chat_id: string
    data: {
      points?: { increment?: number; decrement?: number } | number
      successful_calls?: { increment?: number; decrement?: number } | number
      total_calls?: { increment?: number; decrement?: number } | number
    }
  }): Promise<LeaderboardEntry> {
    try {
      // First check if this mint_address already has a call
      let existingLeaderboard = await prisma.leaderboardEntry.findFirst({
        where: {
          chat_id: param.chat_id,
          telegram_id: param.telegram_id,
        },
      })

      // If call already exists for this token, return null
      if (!existingLeaderboard) {
        existingLeaderboard = await prisma.leaderboardEntry.create({
          data: {
            telegram_id: param.telegram_id,
            chat_id: param.chat_id,
          },
        })
      }

      // If no existing call, create new one
      return await prisma.leaderboardEntry.update({
        data: param?.data,
        where: {
          id: existingLeaderboard?.id,
        },
      })
    } catch (error) {
      appLogger.error('Error fetching first caller: ', error)
      throw new Error('Error fetching first caller: ' + error)
    }
  }
}
