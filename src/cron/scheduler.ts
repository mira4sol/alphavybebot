import { appLogger } from '@/utils/logger.util'
import { cleanupOldTransactions } from './cleanup_transactions.cron'
import { fetchTopTokens } from './top_tokens.cron'

let cronInterval: NodeJS.Timeout | null = null
let isJobRunning = false

export const startCronJobs = async () => {
  // Clear any existing interval
  if (cronInterval) {
    clearInterval(cronInterval)
  }

  // Run fetchTopTokens and cleanupOldTransactions every 5 minutes
  cronInterval = setInterval(async () => {
    // Skip if previous job is still running
    if (isJobRunning) {
      appLogger.info('Previous cron job still running, skipping this execution')
      return
    }

    try {
      isJobRunning = true
      await Promise.all([fetchTopTokens(), cleanupOldTransactions()])
    } catch (error) {
      appLogger.error('Error in cron jobs:', error)
    } finally {
      isJobRunning = false
    }
  }, 5 * 60 * 1000) // 5 minutes

  // Run immediately on startup
  try {
    isJobRunning = true
    appLogger.log('info', 'Running initial cron jobs')
    await Promise.all([fetchTopTokens(), cleanupOldTransactions()])
  } catch (error) {
    appLogger.error('Error in initial cron jobs:', error)
  } finally {
    isJobRunning = false
  }

  appLogger.info('Cron jobs started')
}

export const stopCronJobs = () => {
  if (cronInterval) {
    clearInterval(cronInterval)
    cronInterval = null
    appLogger.info('Cron jobs stopped')
  }
}
