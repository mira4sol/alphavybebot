import { Param, Query } from '@/decorators/ParameterDecorators'
import { Controller, Get } from '@/decorators/RouteDecorators'
import { UserModel } from '@/models/user.model'
import { AppError } from '@/utils/custom_error/app_error'

@Controller('/:version')
export class LegacyTokenListController {
  @Get('/:query')
  baseApp() {
    return 'Hello World'
  }
}
