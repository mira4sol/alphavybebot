import { UserModel } from '@/models/user.model'
import { bot } from '@/utils/platform'
import { deleteMessageCallback } from './tg_callback/delete_tg_callback'
import { callsCommand } from './tg_commands/calls.tg_command'
import { chartCommand } from './tg_commands/chart.tg_command'
import { leaderboardCommand } from './tg_commands/leaderboard.tg_command'
import { messageCommand } from './tg_commands/message.tg_command'
import { startCommand } from './tg_commands/start.tg_command'
import { trendingCommand } from './tg_commands/trending.tg_command'
import { walletCommand } from './tg_commands/wallet.tg_command'

bot.use(async (ctx, next) => {
  // add user if not exists
  await UserModel.addUserIfNotExists(
    ctx?.from?.id?.toString() || ctx?.message?.from?.id?.toString() || '',
    ctx?.message?.from?.username ||
      ctx?.message?.from?.first_name ||
      ctx?.message?.from?.username ||
      ctx?.message?.from?.first_name
  )

  await next() // runs next middleware
})

// app commands
bot.command('start', startCommand)
bot.command('help', startCommand)
bot.command('calls', callsCommand)
bot.command('chart', chartCommand)
bot.command('trending', trendingCommand)
bot.command('leaderboard', leaderboardCommand)
bot.command('wallet', walletCommand)

// handle message
bot.on('message', messageCommand)

bot.action('delete', deleteMessageCallback)
