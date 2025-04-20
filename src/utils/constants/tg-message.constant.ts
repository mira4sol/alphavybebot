// import { GetTokenDetailsResponse200 } from '.api/apis/vybe-api/types'
import { GetTokenDetailsResponse200 } from '@api/vybe-api'
import { TokenCall } from '@prisma/client'
import { vybeFYITokenLink } from '../links.util'
import {
  calculatePriceChangeWithSymbol,
  calculatePriceMultiplierWithEmoji,
} from '../number.helper'
import { formatDecimalPrice, formatLongNumber } from '../string'

export const startMessage = (userName: string) => `Hello ${userName} 🚀

Welcome to *Alpha Vybe* - Your Ultimate Trading Community Bot! 

I'm here to transform your trading experience into an exciting competition. Track wallets & tokens, make calls, and climb the leaderboard! 🏆

*Key Features:*
🎯 Make token calls and earn points
📈 Track real-time token metrics
🏆 Compete on the leaderboard
🔍 Monitor top trending tokens
💼 Track wallet activities

*Available Commands:*
/start - Start your Vybe journey
/leaderboard - See who's crushing it
/wallet - Track wallet details
/calls - View recent token calls
/chart - Get token price charts
/tt - Top Solana tokens
/ttg - View top global tokens
/trending - Real-time trending tokens
/help - Get detailed guidance

Ready to prove you're the ultimate trader? Let's Vybe! 🌟

Join the competition, make your calls, and watch your rank rise! Remember - great calls earn points, but poor ones might cost you. May the best trader win! 📊`

// Rest of the file remains unchanged...
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
