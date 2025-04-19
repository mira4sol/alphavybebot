import { telegramRequests } from './utils/api_requests/telegram.request'
import { appLogger } from './utils/logger.util'

export const runInitialScripts = async () => {
  const setTGHookResponse = await telegramRequests.setTelegramWebHook()

  if (!setTGHookResponse.success) {
    appLogger.info(
      `Telegram Hook URL req failed : ${setTGHookResponse?.message}`
    )
  } else {
    appLogger.info('Telegram Hook URL set successfully')
  }
}
