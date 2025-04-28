// import { GetTokenDetailsResponse200 } from '.api/apis/vybe-api/types'
import { Risk, RugResponse, TokenHolder } from '@/types/rug.interface'
import { GetTokenDetailsResponse200 } from '@api/vybe-api'
import { TokenCall } from '@prisma/client'
import {
  calculatePriceChangeWithSymbol,
  calculatePriceMultiplierWithEmoji,
  formatNumber,
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
  firstCaller?: TokenCall,
  rugData?: RugResponse
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

  const rugMessage = rugResponse
    ? rugResponse({
        score: rugData?.score_normalised || 0,
        holders: rugData?.totalHolders || 0,
        rugged: rugData?.rugged || false,
        verified: tokenDetails?.verified || false,
        risks: rugData?.risks || [],
        top_holders: rugData?.topHolders || [],
      })
    : ''

  return `🟣*${tokenDetails.name || 'Unknown'} (${
    tokenDetails.symbol || 'Unknown'
  })*

*Token Details* 📊
├ Price:   *$${formatDecimalPrice(
    tokenDetails.price || rugData?.price || 0,
    5
  )}* (${priceChange} 24h)
├ MC:   *$${formatLongNumber(tokenDetails?.marketCap || 0) || 'Unknown'}*
├ Liquidity:   *$${
    formatLongNumber(rugData?.totalMarketLiquidity || 0) || 'Unknown'
  }*
├ Supply:   *${formatLongNumber(tokenDetails?.currentSupply || 0) || 'Unknown'}*
└ Vol (24h):   *$${
    formatLongNumber(tokenDetails.usdValueVolume24h || 0) || 'Unknown'
  }*
${firstCallerMessage}
${rugMessage}
${tokenDetails.mintAddress || 'Unknown'}
`
  // └${vybeFYITokenLink(
  //   'Analyze with Vybe',
  //   tokenDetails?.mintAddress || 'Unknown'
  // )}
}

const rugResponse = ({
  holders,
  score,
  verified,
  rugged,
  risks,
  top_holders,
}: {
  holders: number
  score: number
  verified: boolean
  rugged: boolean
  risks: Risk[]
  top_holders: TokenHolder[]
}) => {
  const riskText = risks
    .map((risk) => `⚠️ ${risk.level}: ${risk.description}`)
    .join('\n')

  const insiders = top_holders.filter((holder) => holder.insider).length

  return `Risk Analyses ⚠️
├ *score:*    ${score}/10
├ *holders:*  ${formatNumber(holders)}
├ *insiders:* ${formatNumber(insiders)}
├ *rugged:*   ${rugged ? '🔴' : '🟢'}
└ *Verified:* ${verified ? '🟢' : '🔴'}
${riskText}
  `
}
