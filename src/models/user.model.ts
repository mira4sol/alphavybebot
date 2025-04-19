import { appLogger } from '@/utils/logger.util'
import { prisma } from '@/utils/prisma.helper'
import { TgUser } from '@prisma/client'

export class UserModel {
  /**
   * Add a new user if they don't exist, or return existing user
   */
  static async addUserIfNotExists(
    telegramId: string, // Changed from number
    username?: string
  ): Promise<TgUser> {
    console.log(
      'add user payload, telegram:',
      telegramId,
      'username:',
      username
    )
    try {
      const user = await prisma.tgUser.upsert({
        where: {
          telegram_id: telegramId,
        },
        update: {}, // No updates if exists
        create: {
          telegram_id: telegramId,
          username: username,
        },
      })

      // await createUserWallet(user.telegram_id)

      return user
    } catch (error) {
      appLogger.error('Error adding user:', error)
      throw new Error('Error adding user: ' + error)
    }
  }

  /**
   * Get user's referral count
   */
  static async getReferralCount(telegramId: string): Promise<number> {
    const user = await prisma.tgUser.findUnique({
      where: { telegram_id: telegramId },
      select: { referralCount: true },
    })
    return user?.referralCount ?? 0
  }

  /**
   * Get all referrals for a user
   */
  static async getReferrals(telegramId: string): Promise<TgUser[]> {
    const user = await prisma.tgUser.findUnique({
      where: { telegram_id: telegramId },
      include: { referrals: true },
    })
    return user?.referrals ?? []
  }

  /**
   * Add referral relationship between users using referral code
   */
  static async addReferral(
    referralCode: string,
    refereeTelegramId: string // Changed from number
  ): Promise<TgUser> {
    // Find referrer by their referral code
    const referrer = await prisma.tgUser.findUnique({
      where: { referral_code: referralCode },
    })

    if (!referrer) throw new Error('Invalid referral code')

    const user = await prisma.$transaction([
      // First increment the referrer's count
      prisma.tgUser.update({
        where: { id: referrer.id },
        data: {
          referralCount: {
            increment: 1,
          },
        },
      }),
      // Then connect the referee to the referrer
      prisma.tgUser.update({
        where: { telegram_id: refereeTelegramId },
        data: {
          referred_by: {
            connect: { id: referrer.id },
          },
        },
      }),
    ])

    return user[1]
  }

  /**
   * Get user's referral code
   */
  static async getReferralCode(telegramId: string): Promise<string | null> {
    const user = await prisma.tgUser.findUnique({
      where: { telegram_id: telegramId },
      select: { referral_code: true },
    })
    return user?.referral_code ?? null
  }

  /**
   * Find user by referral code
   */
  static async findByReferralCode(
    referralCode: string
  ): Promise<TgUser | null> {
    return await prisma.tgUser.findUnique({
      where: { referral_code: referralCode },
    })
  }

  /**
   * Get user by telegram ID
   */
  static async getByTelegramId(telegramId: string): Promise<TgUser | null> {
    return await prisma.tgUser.findUnique({
      where: { telegram_id: telegramId },
      include: {
        _count: { select: { referrals: true } },
      },
    })
  }

  /**
   * Get paginated list of users
   * @param page Page number (starts from 1)
   * @param limit Number of users per page
   * @returns Object containing users and pagination info
   */
  static async getPaginatedUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [users, total] = await prisma.$transaction([
      prisma.tgUser.findMany({
        skip,
        take: limit,
        orderBy: {
          id: 'desc',
        },
        include: {
          _count: { select: { referrals: true } },
        },
      }),
      prisma.tgUser.count(),
    ])

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}
