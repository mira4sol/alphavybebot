import { ENV } from './constants/env.constants'
import { telegramLinkMarkdown } from './telegram.helpers'

export const alphaVybeDocsLink =
  'https://ahmadmuhammadmak5.gitbook.io/alpha-vyve'

export const vybeFYITokenLink = (label: string, token_address: string) =>
  telegramLinkMarkdown(label, `https://vybe.fyi/tokens/${token_address}`)

export const vybeFYIWalletLink = (label: string, wallet_address: string) =>
  telegramLinkMarkdown(label, `https://vybe.fyi/wallets/${wallet_address}`)

// `[${label}](https://vybe.fyi/tokens/${token_address}`

export const vybeAlphaLink = (label: string, token_address: string) =>
  telegramLinkMarkdown(
    label,
    `https://alpha.vybenetwork.com/tokens/${token_address}`
  )

export const tgProfileLink = (username: string) =>
  telegramLinkMarkdown(username, `https://t.me/${username}`)

export const tgRedirectToBotLink = (username: string, query: string) =>
  telegramLinkMarkdown(username, `https://t.me/${username}?start=${query}`)

// https://t.me/phanes_bot?start=call_-1001994193127_298067976_1w

export const getBotLink =
  ENV.NODE_ENV === 'production'
    ? 'https://t.me/AlphaVybeBot'
    : 'https://t.me/VybeTestBot'
