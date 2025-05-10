import { UserModel } from '@/models/user.model'
import { bot } from '@/utils/platform'
import { deleteMessageCallback } from './tg_callback/delete_tg_callback'
import { settingsCallbackHandler } from './tg_callback/settings.callback'
import { balanceCommand } from './tg_commands/balance.tg_command'
import { callsCommand } from './tg_commands/calls.tg_command'
import { cancelAlertCommand } from './tg_commands/cancel_alert.tg_command'
import { chartCommand } from './tg_commands/chart.tg_command'
import { leaderboardCommand } from './tg_commands/leaderboard.tg_command'
import { messageCommand } from './tg_commands/message.tg_command'
import { premiumCommand } from './tg_commands/premium.tg_command'
import { settingsCommand } from './tg_commands/settings.tg_command'
import { startCommand } from './tg_commands/start.tg_command'
import { topTokensCommand } from './tg_commands/top_tokens.tg_command'
import { trendingCommand } from './tg_commands/trending.tg_command'
import { walletCommand } from './tg_commands/wallet.tg_command'
import { walletAlertCommand } from './tg_commands/walllet_alert.tg_command'

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
bot.command('wa', (ctx) => walletAlertCommand(ctx, 'Wallet'))
bot.command('ta', (ctx) => walletAlertCommand(ctx, 'Mint'))
bot.command('tt', (ctx) => topTokensCommand(ctx, true))
bot.command('ttg', (ctx) => topTokensCommand(ctx, false))
bot.command('ca', cancelAlertCommand)
bot.command('pro', premiumCommand)
bot.command('balance', balanceCommand)
bot.command('settings', settingsCommand)

// handle message
bot.on('message', messageCommand)

bot.action('delete', deleteMessageCallback)
bot.action(/settings:(.+)/, settingsCallbackHandler)
bot.action(/settings:(.+)/, (ctx) => {
  ctx.match
})
