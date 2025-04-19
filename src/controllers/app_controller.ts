import { Param, Query } from '@/decorators/ParameterDecorators'
import { Controller, Get } from '@/decorators/RouteDecorators'
import { UserModel } from '@/models/user.model'
import { AppError } from '@/utils/custom_error/app_error'

@Controller('/:version')
export class AppController {
  @Get('/')
  baseApp() {
    return 'Hello World'
  }

  @Get('/users/:telegramId')
  getUser(@Param('telegramId') telegramId: string) {
    console.log('telegramId', telegramId)
    if (!telegramId) {
      throw new AppError({
        message: 'Telegram ID is required',
      })
    }
    // 6933280784
    return UserModel.getByTelegramId(telegramId)
  }

  // Example with multiple decorators
  @Get('/users/search')
  searchUsers(@Query('name') name: string, @Query('age') age: number) {
    // return UserModel.searchUsers({ name, age })
  }

  // Example with request object
  // @Get('/debug')
  // debugRequest(@Req() req: Request) {
  //   return {
  //     headers: req.headers,
  //     params: req.params,
  //     query: req.query,
  //   }
  // }
}
