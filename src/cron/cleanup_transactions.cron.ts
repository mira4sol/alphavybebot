import { appLogger } from '@/utils/logger.util'
import { prisma } from '@/utils/prisma.helper'

export const cleanupOldTransactions = async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const result = await prisma.transaction.deleteMany({
      where: {
        created_at: {
          lt: fiveMinutesAgo,
        },
      },
    })

    appLogger.info(`Cleaned up ${result.count} old transactions`)
  } catch (error) {
    appLogger.error('Error in cleanup transactions cron:', error)
  }
}
