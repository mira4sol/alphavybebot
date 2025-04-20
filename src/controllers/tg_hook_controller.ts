import { Controller, Post } from '@/decorators/RouteDecorators'
import '@/services/telegram.service'
import { bot } from '@/utils/platform'
import { Request } from 'express'

@Controller('/:version/tg-hook')
export class TelegramHookController {
  @Post('/')
  async triggerTg(request: Request) {
    bot.handleUpdate(request.body)
  }
}
