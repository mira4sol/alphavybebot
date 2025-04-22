import { appLogger } from '@/utils/logger.util'
import { prisma } from '@/utils/prisma.helper'
import { AddressType } from '@prisma/client'

export class SubscriptionModel {
  static async subscribed(param: {
    chat_id: string
    address: string
    address_type: AddressType
  }) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          chat_id: param?.chat_id,
          address: param?.address,
        },
      })

      if (subscription) throw new Error(`${param?.address} already subscribed`)

      await prisma.subscription.create({
        data: {
          address_type: param?.address_type,
          address: param?.address,
          chat_id: param?.chat_id,
        },
      })
    } catch (error: any) {
      appLogger.error('Error subscribing: ', error)
      throw new Error(error?.message || error)
    }
  }

  static async unsubscribed(param: { chat_id: string; address: string }) {
    try {
      await prisma.subscription.deleteMany({
        where: {
          chat_id: param?.chat_id,
          address: param?.address,
        },
      })
    } catch (error) {
      appLogger.error('Error unsubscribing: ', error)
      throw new Error('Error unsubscribing: ' + error)
    }
  }
}
