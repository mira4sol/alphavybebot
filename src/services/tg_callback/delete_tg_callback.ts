import { Context } from 'telegraf'
import { CallbackQuery, Update } from 'telegraf/typings/core/types/typegram'

export const deleteMessageCallback = async (
  ctx: Context<Update.CallbackQueryUpdate<CallbackQuery>>
) => {
  try {
    const callbackQuery = ctx.update.callback_query
    const originalUserId = callbackQuery?.from?.id
    const messageToDelete = callbackQuery?.message

    // Check if the user who clicked is the original sender
    if (originalUserId && messageToDelete) {
      await ctx.deleteMessage(messageToDelete.message_id)
    } else {
      await ctx.answerCbQuery(
        '❌ Only the original sender can delete this message'
      )
    }
  } catch (error: any) {
    console.error('Error deleting message:', error)
    await ctx.answerCbQuery('Failed to delete message')
  }
}
