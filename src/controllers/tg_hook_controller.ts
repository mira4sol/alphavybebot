import { Controller, Post } from '@/decorators/RouteDecorators'
import { TelegramService } from '@/services/telegram.service'
import { Request } from 'express'

@Controller('/:version/tg-hook')
export class TelegramHookController {
  telegramService = new TelegramService()

  @Post('/')
  async triggerTg(request: Request) {
    await this.telegramService.handleMessage(request.body)
  }
}
