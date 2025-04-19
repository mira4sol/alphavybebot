export interface TelegramUpdate {
  update_id: number
  message: TelegramMessage
  callback_query?: TelegramCallbackQuery
}

// Add these new interfaces
export interface TelegramCallbackQuery {
  id: string
  from: TelegramUser
  message?: TelegramMessage
  chat_instance: string
  data: string
}

interface TelegramMessage {
  message_id: number
  from: TelegramUser
  chat: TelegramChat
  date: number
  text: string
  entities?: TelegramMessageEntity[]
  photo?: any
  caption?: string
  caption_entities?: any
  reply_markup?: object
}

interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

interface TelegramChat {
  id: number
  title?: string
  first_name?: string
  username?: string
  all_members_are_administrators?: boolean
  type: 'private' | 'group' | 'supergroup' | 'channel'
  accepted_gift_types?: {
    unlimited_gifts: boolean
    limited_gifts: boolean
    unique_gifts: boolean
    premium_subscription: boolean
  }
}

interface TelegramMessageEntity {
  type: string
  offset: number
  length: number
}
