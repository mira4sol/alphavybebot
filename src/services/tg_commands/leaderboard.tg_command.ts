import { LeaderboardModel } from '@/models/leaderboard.model'
import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { tgRedirectToBotLink } from '@/utils/links.util'
import { appLogger } from '@/utils/logger.util'
import { escapeTelegramChar } from '@/utils/telegram.helpers'
import { Context } from 'telegraf'

const LOG_NAME = '[LeaderboardCommand::Message]'

export const leaderboardCommand = async (ctx: Context) => {
  let deleteMessageId = 0

  try {
    if (ctx?.message?.chat?.type === 'private')
      return await ctx.reply('This command can only be used in groups ⛔️', {
        reply_parameters: { message_id: ctx?.msgId || 0 },
        reply_markup: {
          inline_keyboard: [tgDeleteButton],
        },
      })

    deleteMessageId = (
      await ctx.reply('⏳ Fetching leaderboard...', {
        reply_parameters: { message_id: ctx?.msgId || 0 },
      })
    )?.message_id

    const getLeaderBoard = await LeaderboardModel.getGroupLeaderboard(
      ctx?.chat?.id?.toString() || ''
    )
    // console.log('leaderboardCommand', getLeaderBoard)

    const leaderboardTexts = getLeaderBoard.leaderboard
      .map((item, index) => {
        const query = `call_${ctx?.message?.chat?.id}_${ctx?.message?.from?.id}`
        return `>🟣${index + 1} ${
          escapeTelegramChar(item.user?.username || '')
            ? `${tgRedirectToBotLink(item.user?.username || '', query)}`
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

    await ctx.reply(leaderboardMessagText, {
      reply_parameters: { message_id: ctx.msgId || 0 },
      parse_mode: 'MarkdownV2',
      link_preview_options: {
        is_disabled: true,
      },
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
  } catch (error: any) {
    appLogger.error('[/leaderboard] - An error occurred', error)
    const msg =
      error?.data?.message || error?.message || 'Unable to fetch leaderboard'
    await ctx.reply('❌ Oh chim 🥹\n' + msg, {
      reply_parameters: { message_id: ctx?.msgId || 0 },
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
  } finally {
    if (deleteMessageId) await ctx.deleteMessage(deleteMessageId)
  }
}
