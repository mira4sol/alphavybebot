import { UserModel } from '@/models/user.model'
import { TelegramUpdate } from '@/types'
import { callsCommand } from './tg_commands/calls.tg_command'
import { chartCommand } from './tg_commands/chart.tg_command'
import { leaderboardCommand } from './tg_commands/leaderboard.tg_command'
import { messageCommand } from './tg_commands/message.tg_command'
import { startCommand } from './tg_commands/start.tg_command'
import { trendingCommand } from './tg_commands/trending.tg_command'
import { walletCommand } from './tg_commands/wallet.tg_command'

export class TelegramService {
  async handleMessage(payload: TelegramUpdate) {
    // console.log('payload', payload)

    // add user if not exists
    await UserModel.addUserIfNotExists(
      payload?.message?.from?.id?.toString(),
      payload?.message?.from?.username || payload?.message?.from?.first_name
    )

    // callback
    if (payload?.callback_query) {
      console.log('Telegram payload', payload)
      return
    }

    const text = payload?.message?.text
    // const chat_id = payload?.message?.from?.id?.toString() || '' // user telegram id
    const chat_id = payload?.message?.chat?.id?.toString() // chat id

    if (text?.startsWith('/start')) return await startCommand(chat_id, payload)
    if (text?.startsWith('/calls')) return await callsCommand(chat_id, payload)
    if (text?.startsWith('/chart')) return await chartCommand(chat_id, payload)
    if (text?.startsWith('/trending'))
      return await trendingCommand(chat_id, payload)
    if (text?.startsWith('/leaderboard'))
      return await leaderboardCommand(chat_id, payload)
    if (text?.startsWith('/wallet'))
      return await walletCommand(chat_id, payload)

    return await messageCommand(chat_id, payload)
  }
}
