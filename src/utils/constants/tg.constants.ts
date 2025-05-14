import { Context } from 'telegraf'
import { alphaVybeDocsLink } from '../links.util'

export const tgDocsButton = [
  { text: 'Read Documentation 📚', url: alphaVybeDocsLink },
]

export const tgDeleteButton = [
  {
    text: '🗑️',
    callback_data: 'delete',
  },
]

export const tgTradeButton = (ctx: Context) => [
  {
    text: '🗑️',
    callback_data: 'delete',
  },
]
