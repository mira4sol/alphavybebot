import { SettingsModel } from '@/models/settings.mode'
import { TelegrafCallbackContext } from '@/types/telegram.interface'
import { settingsCommand } from '../tg_commands/settings.tg_command'

export const settingsCallbackHandler = async (ctx: TelegrafCallbackContext) => {
  const callbackData = ctx.match[1] // Extract the specific action from the callback_data
  const telegramId = ctx.from?.id.toString()

  await ctx.sendChatAction('typing')

  if (!telegramId) {
    return await ctx.answerCbQuery('Error: User ID not found')
  }

  try {
    switch (callbackData) {
      case 'general_settings':
        await ctx.answerCbQuery('General settings clicked')
        break

      case 'auto_buy':
        await ctx.answerCbQuery('Auto buy clicked')
        break

      case 'change_auto_buy':
        // Toggle auto buy setting
        const currentSettings = await SettingsModel.findUserSettings(telegramId)
        await SettingsModel.updateUserSettings(telegramId, {
          auto_buy_enabled: !currentSettings.auto_buy_enabled,
        })
        await ctx.answerCbQuery('Auto buy setting updated')
        // Refresh the settings message
        await settingsCommand(ctx)
        break

      case 'update_auto_buy_amount_sol':
        // Set session for auto buy amount input
        ctx.session = {
          ...ctx.session,
          waitingForInput: 'auto_buy_amount_sol',
          originalMessageId: ctx.callbackQuery?.message?.message_id,
        }
        await ctx.answerCbQuery('Please enter the new auto buy amount in SOL')
        await ctx.reply(
          'Please enter the new auto buy amount in SOL (e.g., 0.5)'
        )
        break

      case 'left_buy_config':
        // Set session for left buy amount input
        ctx.session = {
          ...ctx.session,
          waitingForInput: 'left_buy_amount_sol',
          originalMessageId: ctx.callbackQuery?.message?.message_id,
        }
        await ctx.answerCbQuery('Please enter the new left buy amount in SOL')
        await ctx.reply(
          'Please enter the new left buy amount in SOL (e.g., 0.1)'
        )
        break

      case 'right_buy_config':
        // Set session for right buy amount input
        ctx.session = {
          ...ctx.session,
          waitingForInput: 'right_buy_amount_sol',
          originalMessageId: ctx.callbackQuery?.message?.message_id,
        }
        await ctx.answerCbQuery('Please enter the new right buy amount in SOL')
        await ctx.reply(
          'Please enter the new right buy amount in SOL (e.g., 1.0)'
        )
        break

      case 'sell_partial_percentage':
        // Set session for partial sell percentage input
        ctx.session = {
          ...ctx.session,
          waitingForInput: 'sell_partial_percentage',
          originalMessageId: ctx.callbackQuery?.message?.message_id,
        }
        await ctx.answerCbQuery('Please enter the new partial sell percentage')
        await ctx.reply(
          'Please enter the new partial sell percentage (e.g., 25)'
        )
        break

      case 'sell_full_percentage':
        // Set session for full sell percentage input
        ctx.session = {
          ...ctx.session,
          waitingForInput: 'sell_full_percentage',
          originalMessageId: ctx.callbackQuery?.message?.message_id,
        }
        await ctx.answerCbQuery('Please enter the new full sell percentage')
        await ctx.reply('Please enter the new full sell percentage (e.g., 100)')
        break

      default:
        await ctx.answerCbQuery('Unknown action')
    }
  } catch (error: any) {
    console.error('Error in settings callback:', error)
    await ctx.answerCbQuery('Error: ' + (error.message || 'Unknown error'))
  }
}
