// import { GetTokenDetailsResponse200 } from '.api/apis/vybe-api/types'
import { GetTokenDetailsResponse200 } from '@api/vybe-api'
import { TokenCall } from '@prisma/client'
import { vybeFYITokenLink } from '../links.util'
import {
  calculatePriceChangeWithSymbol,
  calculatePriceMultiplierWithEmoji,
} from '../number.helper'
import { formatDecimalPrice, formatLongNumber } from '../string'

export const startMessage = (userName: string) => `Hello ${userName} 👋,

Welcome to *VybeOnChain* 🚀

I'm your dedicated Telegram bot for real-time, on-chain crypto analytics, powered by the Vybe Alpha.

Here's what I can do for you:

*Track Wallets*: Get notified about transactions of specific crypto wallets.
*Monitor Token Metrics*: Stay updated on key metrics like price changes, volume, and market cap.
*Receive Whale Alerts*: Be the first to know about significant transactions by large holders.

To get started, try using the following commands:

/track_wallet <wallet_address> - Track a specific wallet.
/token_metrics <token_symbol> - Get metrics for a specific token.
/enable_whale_alerts - Turn on notifications for large transactions.
/help - See a full list of available commands.

Let's dive into the world of on\-chain data with VybeOnChain 📊`

export const sendTgTokenDetailsMessage = (
  tokenDetails: Partial<GetTokenDetailsResponse200>,
  firstCaller?: TokenCall
) => {
  console.log('tokenDetails', tokenDetails)
  // console.log('caller', firstCaller)
  const priceChange = calculatePriceChangeWithSymbol(
    tokenDetails?.price || 0,
    tokenDetails.price1d || 0
  )

  const x = calculatePriceMultiplierWithEmoji(
    tokenDetails?.marketCap || 0,
    firstCaller?.market_cap || 0
  )

  const firstCallerMessage = firstCaller
    ? `*\nFirst Call (${calculatePriceMultiplierWithEmoji(
        tokenDetails?.marketCap || 0,
        firstCaller?.market_cap || 0
      )}):* [${firstCaller.username}](https://t.me/${
        firstCaller.username
      }) @ $${formatLongNumber(
        firstCaller?.market_cap
      )} \\[${calculatePriceChangeWithSymbol(
        tokenDetails?.marketCap || 0,
        firstCaller?.market_cap || 0
      )}\]\n`
    : ''

  return `🟣*${tokenDetails.name || 'Unknown'} (${
    tokenDetails.symbol || 'Unknown'
  })*

*Token Details* 📊
├ Price:   *$${formatDecimalPrice(
    tokenDetails.price || 0,
    5
  )}* (${priceChange} 24h)
├ MC:   *$${formatLongNumber(tokenDetails?.marketCap || 0) || 'Unknown'}*
├ Supply:   *${formatLongNumber(tokenDetails?.currentSupply || 0) || 'Unknown'}*
├ Vol (24h):   *$${
    formatLongNumber(tokenDetails.usdValueVolume24h || 0) || 'Unknown'
  }*
└ *Verified:* ${tokenDetails.verified ? '🟢' : '🔴'}
${firstCallerMessage}
${tokenDetails.mintAddress || 'Unknown'}
└${vybeFYITokenLink(
    'Analyze with Vybe',
    tokenDetails?.mintAddress || 'Unknown'
  )}
`
}
