import { SettingsModel } from '@/models/settings.mode'
import { tgDeleteButton, tgDocsButton } from '@/utils/constants/tg.constants'
import { appLogger } from '@/utils/logger.util'
import { Context } from 'telegraf'

export const settingsCommand = async (ctx: Context) => {
  let deleteMessageId = 0

  try {
    // if it a token and a group, only admins should be able to use it
    if (ctx?.chat?.type !== 'private') {
      throw new Error(`❌ Send me a DM to use this command`)
      // return await ctx.reply(
      //   // `❌ Only admins can use this command in groups to avoid spamming`,
      //   `❌ Send me a DM to use this command`,
      //   {
      //     reply_parameters: { message_id: ctx?.msgId || 0 },
      //     reply_markup: {
      //       inline_keyboard: [tgDeleteButton],
      //     },
      //   }
      // )
    }

    deleteMessageId =
      (
        await ctx.reply('⏳ Fetching settings...', {
          reply_parameters: { message_id: ctx?.msgId || 0 },
        })
      )?.message_id || 0

    const settings = await SettingsModel.findUserSettings(
      ctx?.chat?.id?.toString() || ''
    )
    if (!settings) throw new Error('User settings not found')

    let message = `⚙️ *Settings Menu*\n\n`
    message += `Configure your preferences for the bot.\n\n`
    message += `*General Settings:*\nAdjust overall bot behavior.\n\n`
    message += `*Auto Buy:*\nEnable or disable automatic buying of tokens.\n\n`
    message += `*Buy/Sell Button Configuration:*\nCustomize the amounts for quick buy and sell actions.`

    ctx.reply(message, {
      reply_parameters: { message_id: ctx?.msgId || 0 },
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '--- GENERAL SETTINGS ---',
              callback_data: 'settings:general_settings',
            },
          ],
          // auto buy
          [{ text: '--- AUTO BUY ---', callback_data: 'settings:auto_buy' }],
          [
            {
              text: settings?.auto_buy_enabled ? '🟢 Enabled' : '🔴 Disabled',
              callback_data: 'settings:change_auto_buy',
            },
            {
              text: '✍🏼 ' + settings?.auto_buy_amount_sol + ' SOL',
              callback_data: 'settings:update_auto_buy_amount_sol',
            },
          ],
          [
            {
              text: '--- BUY BUTTONS CONFIG ---',
              callback_data: 'settings:buy_buttons_config',
            },
          ],
          // Buy configs
          [
            {
              text: '✍🏼 Left: ' + settings?.buy_amount_sol + ' SOL',
              callback_data: 'settings:left_buy_config',
            },
            {
              text: '✍🏼 Right: ' + settings?.max_buy_amount_sol + ' SOL',
              callback_data: 'settings:right_buy_config',
            },
          ],
          [
            {
              text: '--- SELL BUTTONS CONFIG ---',
              callback_data: 'settings:sell_buttons_config',
            },
          ],
          // Sell Configs
          [
            {
              text: '✍🏼 Left: ' + settings?.sell_partial_percentage + '%',
              callback_data: 'settings:sell_partial_percentage',
            },
            {
              text: '✍🏼 Right: ' + settings?.sell_full_percentage + '%',
              callback_data: 'settings:sell_full_percentage',
            },
          ],
          tgDocsButton,
          tgDeleteButton,
        ],
      },
    })
  } catch (error: any) {
    appLogger.error('Error fetching wallet balance: ', error)
    await ctx.reply(error?.data?.message || 'Unable to cancel alert')
    const msg = error?.data?.message || error?.message || 'Unable to subscribe'
    await ctx.reply(msg, {
      reply_parameters: { message_id: ctx?.msgId || 0 },
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
  } finally {
    if (deleteMessageId && deleteMessageId !== 0)
      await ctx.deleteMessage(deleteMessageId)
  }
}
