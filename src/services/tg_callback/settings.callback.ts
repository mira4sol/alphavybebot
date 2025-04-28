import { TelegrafCallbackContext } from '@/types/telegram.interface'
import { Context } from 'telegraf'
import { CallbackQuery, Update } from 'telegraf/typings/core/types/typegram'

export const settingsCallbackHandler = async (ctx: TelegrafCallbackContext) => {
  const callbackData = ctx.match[1] // Extract the specific action from the callback_data
  // const callbackData = ctx?.callbackQuery?.id // Extract the specific action from the callback_data
  console.log('callbackData', ctx.match)

  switch (callbackData) {
    case 'general_settings':
      // Handle general settings action
      await ctx.answerCbQuery('General settings clicked')
      break
    case 'auto_buy':
      // Handle auto buy action
      await ctx.answerCbQuery('Auto buy clicked')
      break
    case 'change_auto_buy':
      await ctx.answerCbQuery('Change Auto Buy')
      break
    case 'update_auto_buy_amount_sol':
      // Handle update auto buy amount action
      await ctx.answerCbQuery('Update auto buy amount clicked')
      break
    case 'buy_buttons_config':
      // Handle buy buttons config action
      await ctx.answerCbQuery('Buy buttons config clicked')
      break
    case 'left_buy_config':
      await ctx.answerCbQuery('Left Buy Config')
      break
    case 'right_buy_config':
      // Handle right buy config action
      await ctx.answerCbQuery('Right buy config clicked')
      break
    case 'sell_buttons_config':
      // Handle sell buttons config action
      await ctx.answerCbQuery('Sell buttons config clicked')
      break
    case 'sell_partial_percentage':
      // Handle sell partial percentage action
      await ctx.answerCbQuery('Sell partial percentage clicked')
      break
    case 'sell_full_percentage':
      // Handle sell full percentage action
      await ctx.answerCbQuery('Sell full percentage clicked')
      break
    default:
      await ctx.answerCbQuery('Unknown action')
  }
}
