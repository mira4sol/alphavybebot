import { LeaderboardModel } from '@/models/leaderboard.model'
import { TelegramUpdate } from '@/types'
import { tgRedirectToBotLink } from '@/utils/links.util'
import { appLogger } from '@/utils/logger.util'
import { bot } from '@/utils/platform'

const LOG_NAME = '[LeaderboardCommand::Message]'

export const leaderboardCommand = async (
  chat_id: string,
  payload: TelegramUpdate
) => {
  try {
    const text = payload?.message?.text

    if (payload?.message?.chat?.type === 'private')
      return await bot.telegram.sendMessage(
        chat_id,
        'This command can only be used in groups ⛔️'
      )

    const getLeaderBoard = await LeaderboardModel.getGroupLeaderboard(chat_id)
    console.log('leaderboardCommand', getLeaderBoard)

    const leaderboardTexts = getLeaderBoard.leaderboard
      .map((item, index) => {
        const query = `call_${payload?.message?.chat?.id}_${payload?.message?.from?.id}`
        return `>🟣${index + 1} ${
          item.user?.username
            ? `${tgRedirectToBotLink(item.user?.username, query)}`
            : 'Anonymous'
        } \\- ${item.points} points`
      })
      .join('\n')

    const leaderboardMessagText = leaderboardTexts
      ? `Stats 📊
├ Calls:      ${getLeaderBoard.totalCalls}
├ Hit Rate:  Coming Soon
├ Hit Rate:  Coming Soon
└ Return:    Coming Soon

${leaderboardTexts}`
      : 'No Leaderboard Yet'

    await bot.telegram.sendMessage(chat_id, leaderboardMessagText, {
      reply_parameters: { message_id: payload?.message?.message_id },
      parse_mode: 'MarkdownV2',
      link_preview_options: {
        is_disabled: true,
      },
    })
  } catch (error: any) {
    appLogger.error('[/leaderboard] - An error occurred', error)
    await bot.telegram.sendMessage(
      chat_id,
      error?.data?.message || 'Error Occurred'
    )
  }
}
