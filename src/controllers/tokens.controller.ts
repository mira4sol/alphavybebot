import { Controller, Get } from '@/decorators/RouteDecorators'
import '@/services/telegram.service'
import { appLogger } from '@/utils/logger.util'
import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

const TOP_TOKENS_FILE = path.join(process.cwd(), 'data', 'top_tokens.json')

@Controller('/:version/tokens')
export class TokensController {
  @Get('/top-tokens')
  async getTopTokens(req: Request, res: Response) {
    try {
      if (!fs.existsSync(TOP_TOKENS_FILE)) {
        return res.status(404).json({
          success: false,
          message: 'Top tokens data not found',
        })
      }

      const data = JSON.parse(fs.readFileSync(TOP_TOKENS_FILE, 'utf-8'))

      return res.json({
        success: true,
        data,
      })
    } catch (error) {
      appLogger.error('Error serving top tokens:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }
}
