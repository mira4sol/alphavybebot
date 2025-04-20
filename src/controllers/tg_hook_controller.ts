import { Controller, Post } from '@/decorators/RouteDecorators'
import '@/services/telegram.service'
import { appLogger } from '@/utils/logger.util'
import { bot } from '@/utils/platform'
import { Request } from 'express'

@Controller('/:version/tg-hook')
export class TelegramHookController {
  @Post('/')
  async triggerTg(request: Request) {
    try {
      bot.handleUpdate(request.body)
    } catch (error) {
      appLogger.error(
        '[TelegramHookController::triggerTg] Error occurred while handling Telegram update',
        error
      )
    }
  }
}
