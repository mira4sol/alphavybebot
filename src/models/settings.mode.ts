import { prisma } from '../utils/prisma.helper'

export class SettingsModel {
  static async findUserSettings(telegram_id: string) {
    try {
      let settings = await prisma.userSettings.findUnique({
        where: { telegram_id },
      })

      if (!settings) {
        // Create default settings if none exist
        settings = await prisma.userSettings.create({
          data: {
            telegram_id,
          },
        })
      }

      return settings
    } catch (error) {
      console.error('Error finding/creating user settings:', error)
      throw error
    }
  }

  static async updateUserSettings(
    telegram_id: string,
    settings: {
      buy_amount_sol?: number
      max_buy_amount_sol?: number
      sell_partial_percentage?: number
      sell_full_percentage?: number
      auto_buy_enabled?: boolean
      auto_sell_enabled?: boolean
    }
  ) {
    try {
      // Ensure settings exist before updating
      await this.findUserSettings(telegram_id)

      // Update the settings
      const updatedSettings = await prisma.userSettings.update({
        where: { telegram_id },
        data: settings,
      })

      return updatedSettings
    } catch (error) {
      console.error('Error updating user settings:', error)
      throw error
    }
  }
}
