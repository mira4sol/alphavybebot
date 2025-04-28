import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { getBotLink } from '@/utils/links.util'
import {
  calculatePriceChange,
  calculatePriceChangeWithSymbol,
} from '@/utils/number.helper'
import { vybeApi } from '@/utils/platform'
import { isValidSolanaAddress } from '@/utils/solana.lib'
import { formatDecimalPrice, formatLongNumber } from '@/utils/string'
import { GetTokenTradeOhlcResponse200 } from '@api/vybe-api'
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import { Context } from 'telegraf'

const LOG_NAME = '[ChartCommand::Message]'

export const chartCommand = async (ctx: Context) => {
  let deleteMessageId = 0
  try {
    const wallet_address = ctx.text?.split(' ')[1]
    const timeframe = ctx.text?.split(' ')[2] || '1d'

    const timeEnd = Math.floor(Date.now() / 1000) // Current time in seconds
    const durationMap: Record<string, number> = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '30m': 1800,
      '1h': 3600,
      '2h': 7200,
      '4h': 14400,
      '8h': 28800,
      '12h': 43200,
      '1d': 86400,
      '3d': 259200,
      '1w': 604800,
      '1M': 2592000,
    }

    if (!durationMap) {
      throw new Error('Invalid duration')
    }

    if (!wallet_address || !isValidSolanaAddress(wallet_address?.trim())) {
      let txt = `❌ Invalid Input! provide a valid mint address
     └ Use /chart <wallet address>, e.g. /chart JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN`

      throw new Error(txt)
      // return await ctx.reply(txt, {
      //   reply_parameters: { message_id: ctx?.msgId || 0 },
      //   reply_markup: {
      //     inline_keyboard: [tgDeleteButton],
      //   },
      // })
    }

    deleteMessageId =
      (
        await ctx.reply('⏳ Fetching wallet details...', {
          reply_parameters: { message_id: ctx?.msgId || 0 },
          reply_markup: {
            inline_keyboard: [tgDeleteButton],
          },
        })
      )?.message_id || 0

    const timeStart = timeEnd - durationMap[timeframe]

    const token_ohlc_req = await vybeApi.get_token_trade_ohlc({
      mintAddress: wallet_address,
      // resolution: timeframe as any,
      timeStart,
      timeEnd,
    })
    const token_ohlc = token_ohlc_req.data

    if (token_ohlc.data.length === 0) {
      throw new Error('❌ No chart data available yet')
      // return ctx.reply('❌ No chart data available yet', {
      //   reply_parameters: { message_id: ctx?.msgId || 0 },
      //   reply_markup: {
      //     inline_keyboard: [tgDeleteButton],
      //   },
      // })
    }

    const token_details_req = await vybeApi.get_token_details({
      mintAddress: wallet_address,
    })
    const token_details = token_details_req.data

    const chartBuffer = await generateCandlestickChart3(
      token_ohlc,
      'sol',
      `${timeframe} price change`,
      {
        symbol: token_details.symbol,
        price: token_details.price,
        changePercentage: calculatePriceChange(
          token_details.price,
          token_details.price1d
        ),
        marketCap: token_details.marketCap,
      }
    )
    // const chartBuffer = await generateCandlestickChart(token_ohlc, '')

    const priceChange = calculatePriceChangeWithSymbol(
      token_details?.price || 0,
      token_details.price1d || 0
    )

    const caption = `📊 Chart Information

🟣*${token_details.name || 'Unknown'} (${token_details.symbol || 'Unknown'})*
├ Price:   *$${formatDecimalPrice(token_details.price, 5)}* (${priceChange} 24h)
├ MC:   *$${formatLongNumber(token_details?.marketCap || 0) || 'Unknown'}*
├ Supply:   *${
      formatLongNumber(token_details?.currentSupply || 0) || 'Unknown'
    }*
└ Vol (24h):   *$${
      formatLongNumber(token_details.usdValueVolume24h || 0) || 'Unknown'
    }*`
    // ${vybeFYITokenLink('Advance Analyses with vybe', wallet_address)}
    await ctx.replyWithPhoto(
      { source: chartBuffer },
      {
        caption,
        parse_mode: 'Markdown',
        reply_parameters: { message_id: ctx?.msgId || 0 },
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Trade',
                // callback_data: 'trade',
                url: getBotLink + '?start=trade_' + token_details.mintAddress,
              },
              // https://t.me/phanes_bot?start=price_3t6qtFX3YYeoUcYKVUCMfC7wVGu9neTfPXC41h63pump
              {
                text: 'Vybe FYI',
                url: `https://vybe.fyi/tokens/${token_details?.mintAddress}`,
              },
            ],
            tgDeleteButton,
          ],
        },
      }
    )

    // await ctx.reply('chartCommand <Todo>', {
    //   reply_parameters: { message_id: ctx?.msgId || 0 },
    //   reply_markup: {
    //     inline_keyboard: [tgDeleteButton],
    //   },
    // })
  } catch (error: any) {
    const msg = error?.data?.message || error?.message || 'Unable to get chart'
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

async function generateCandlestickChart3(
  ohcl: GetTokenTradeOhlcResponse200,
  title: string,
  timeframe: string,
  tokenInfo: {
    symbol: string
    price: number
    changePercentage: number
    marketCap: number
  }
) {
  const data = ohcl.data
  const width = 800
  const height = 700
  const padding = { top: 60, right: 80, bottom: 120, left: 80 } // Increased padding for headers and volume

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Fill background with a darker color for better contrast
  ctx.fillStyle = '#111111'
  ctx.fillRect(0, 0, width, height)

  // Draw token info header
  ctx.fillStyle = '#FFFFFF'

  // Since fonts might be an issue, we'll use simple rectangles for header
  // Symbol and timeframe
  ctx.font = '22px OpenSans'
  ctx.textAlign = 'left'
  ctx.fillText(`${tokenInfo.symbol}/SOL`, 30, 35)

  ctx.font = '16px OpenSans'
  ctx.fillStyle = '#999999'
  ctx.fillText(`(${timeframe})`, 30 + (tokenInfo.symbol.length + 3.5) * 15, 35)

  // Price and change
  ctx.textAlign = 'left'
  const changeColor = tokenInfo.changePercentage >= 0 ? '#44DD44' : '#FF4444'
  const changeSymbol = tokenInfo.changePercentage >= 0 ? '+' : ''

  ctx.font = '16px OpenSans'
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText(
    `Price: $${formatDecimalPrice(tokenInfo.price, 5)}`,
    180 + (tokenInfo.symbol.length + 3) * 15,
    35
  )
  // ctx.fillText(`Price: $${formatDecimalPrice(tokenInfo.price, 5)}`, 260, 35)

  ctx.fillStyle = changeColor
  ctx.fillText(
    `(${changeSymbol}${tokenInfo.changePercentage.toFixed(2)}%)`,
    // 370,
    300 + (tokenInfo.symbol.length + 3.5) * 15,
    35
  )

  // Volatility and market cap
  ctx.fillStyle = '#FFFFFF'
  // ctx.fillText(`• Volatility: ${tokenInfo.volatility}%`, 410, 35)
  ctx.fillText(
    `• MC: $${formatLongNumber(tokenInfo.marketCap || 0)}`,
    380 + (tokenInfo.symbol.length + 3.5) * 15,
    35
  )

  // Find min and max values
  const minLow = Math.min(...data.map((candle) => Number(candle.low)))
  const maxHigh = Math.max(...data.map((candle) => Number(candle.high)))
  const valueRange = maxHigh - minLow

  // Add 5% padding to top and bottom
  const paddedMinY = minLow - valueRange * 0.05
  const paddedMaxY = maxHigh + valueRange * 0.05
  const paddedRange = paddedMaxY - paddedMinY

  // Determine chart area
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Draw grid lines
  ctx.strokeStyle = '#222222'
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + chartHeight * (i / 5)
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()
  }

  // Draw Y-axis labels with price highlighting
  ctx.fillStyle = '#888888'
  ctx.textAlign = 'right'

  // Current price (get from the last candle)
  const currentPrice = Number(data[data.length - 1].close)

  // Draw y-axis with price levels
  for (let i = 0; i <= 5; i++) {
    const value = paddedMaxY - paddedRange * (i / 5)
    const y = padding.top + chartHeight * (i / 5)

    // Draw label
    ctx.fillText(value.toFixed(value < 1 ? 4 : 2), padding.left - 10, y + 4)
  }

  // Calculate candle width
  const candleWidth = (chartWidth / data.length) * 0.6
  const spacing = (chartWidth / data.length) * 0.4

  // Draw candles
  data.forEach((candle, i) => {
    const x = padding.left + i * (candleWidth + spacing) + spacing / 2

    // Convert values to y coordinates
    const openY =
      padding.top +
      ((paddedMaxY - Number(candle.open)) / paddedRange) * chartHeight
    const closeY =
      padding.top +
      ((paddedMaxY - Number(candle.close)) / paddedRange) * chartHeight
    const highY =
      padding.top +
      ((paddedMaxY - Number(candle.high)) / paddedRange) * chartHeight
    const lowY =
      padding.top +
      ((paddedMaxY - Number(candle.low)) / paddedRange) * chartHeight

    // Draw the wick
    ctx.strokeStyle =
      Number(candle.open) > Number(candle.close) ? '#FF4444' : '#44DD44'
    ctx.lineWidth = 1.5 // Slightly thicker wicks
    ctx.beginPath()
    ctx.moveTo(x + candleWidth / 2, highY)
    ctx.lineTo(x + candleWidth / 2, lowY)
    ctx.stroke()

    // Draw the candle body with minimum height of 2px
    const bodyHeight = Math.max(Math.abs(closeY - openY), 2)
    ctx.fillStyle =
      Number(candle.open) > Number(candle.close) ? '#FF4444' : '#44DD44'
    ctx.fillRect(x, Math.min(openY, closeY), candleWidth, bodyHeight)

    // Draw outline for better visibility
    ctx.strokeStyle =
      Number(candle.open) > Number(candle.close) ? '#FF6666' : '#66FF66'
    ctx.lineWidth = 1
    ctx.strokeRect(x, Math.min(openY, closeY), candleWidth, bodyHeight)
  })

  // X-axis time labels
  ctx.fillStyle = '#888888'
  ctx.textAlign = 'center'

  // Show fewer x-axis labels to avoid crowding
  const labelInterval = Math.max(1, Math.floor(data.length / 6))
  for (let i = 0; i < data.length; i += labelInterval) {
    const candle = data[i]
    const x =
      padding.left + i * (candleWidth + spacing) + spacing / 2 + candleWidth / 2
    const timestamp = new Date(candle.time)

    // Format date to show date and time for multi-day charts
    let label
    if (timeframe === '1d' || timeframe === '4h') {
      // For longer timeframes, include month and day
      const month = timestamp.getMonth() + 1
      const day = timestamp.getDate()
      label = `${month}/${day}`
    } else {
      // For shorter timeframes, just the time
      label = timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    ctx.fillText(label, x, height - padding.bottom + 20)
  }

  // Highlight key price points (highest, lowest, current)
  const highestPoint = Math.max(...data.map((c) => Number(c.high)))
  const lowestPoint = Math.min(...data.map((c) => Number(c.low)))

  // Find indexes for key points to position them on x-axis
  const highestIndex = data.findIndex((c) => Number(c.high) === highestPoint)
  const lowestIndex = data.findIndex((c) => Number(c.low) === lowestPoint)

  // Function to highlight a price point
  const highlightPrice = (
    price: number,
    index: number,
    color: string,
    offsetY = 0
  ) => {
    const y = padding.top + ((paddedMaxY - price) / paddedRange) * chartHeight
    const x =
      padding.left +
      index * (candleWidth + spacing) +
      spacing / 2 +
      candleWidth / 2

    // Draw horizontal dotted line
    ctx.strokeStyle = color
    ctx.setLineDash([2, 3])
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw price label
    ctx.fillStyle = '#111111'
    ctx.fillRect(width - padding.right + 5, y - 10 + offsetY, 65, 20)
    ctx.fillStyle = color
    ctx.textAlign = 'left'
    ctx.fillText(
      `$${price.toFixed(3)}`,
      width - padding.right + 10,
      y + 4 + offsetY
    )
  }

  // Highlight highest price point in green
  if (highestIndex >= 0) {
    highlightPrice(highestPoint, highestIndex, '#00B373', -20)
  }

  // Highlight lowest price point in red
  if (lowestIndex >= 0) {
    highlightPrice(lowestPoint, lowestIndex, '#DE3F3E', 20)
  }

  // Highlight current price point in teal/aqua
  highlightPrice(currentPrice, data.length - 1, '#00D1C6', 0)

  // Add volume bars
  if (data[0].volume !== undefined) {
    const maxVolume = Math.max(
      ...data.map((candle) => Number(candle.volume || '0'))
    )
    const volumeHeight = 100 // Fixed height for volume section
    const volumeTop = height - padding.bottom + 50

    // Volume area title
    ctx.fillStyle = '#888888'
    ctx.textAlign = 'left'
    ctx.fillText('Volume', padding.left, volumeTop - 5)

    data.forEach((candle, i) => {
      if (candle.volume === undefined) return

      const x = padding.left + i * (candleWidth + spacing) + spacing / 2
      const volHeight = (Number(candle.volume) / maxVolume) * volumeHeight

      ctx.fillStyle =
        Number(candle.open) > Number(candle.close)
          ? 'rgba(255, 68, 68, 0.5)'
          : 'rgba(68, 221, 68, 0.5)'
      ctx.fillRect(x, volumeTop, candleWidth, volHeight)
    })
  }

  return canvas.toBuffer('image/png')
}

async function generateCandlestickChart1(
  ohcl: GetTokenTradeOhlcResponse200,
  title: string,
  timeframe: string
) {
  const data = ohcl.data
  const width = 800
  const height = 500
  const padding = { top: 40, right: 60, bottom: 60, left: 80 }

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Fill background with a darker color for better contrast
  ctx.fillStyle = '#111111'
  ctx.fillRect(0, 0, width, height)

  console.log('font families', GlobalFonts.families)

  // Draw title with timeframe
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '16px OpenSans'
  // ctx.font = 'bold 16px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`${title} (${timeframe})`, width / 2, 20)

  // Find min and max values
  const minLow = Math.min(...data.map((candle) => Number(candle.low)))
  const maxHigh = Math.max(...data.map((candle) => Number(candle.high)))
  const valueRange = maxHigh - minLow

  // Add 5% padding to top and bottom
  const paddedMinY = minLow - valueRange * 0.05
  const paddedMaxY = maxHigh + valueRange * 0.05
  const paddedRange = paddedMaxY - paddedMinY

  // Determine chart area
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Draw grid lines
  ctx.strokeStyle = '#333333'
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + chartHeight * (i / 5)
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()
  }

  // Draw Y-axis labels
  ctx.fillStyle = '#AAAAAA'
  // ctx.font = '12px Arial'
  ctx.font = '12px OpenSans'
  ctx.textAlign = 'right'

  for (let i = 0; i <= 5; i++) {
    const value = paddedMaxY - paddedRange * (i / 5)
    const y = padding.top + chartHeight * (i / 5)

    // Draw label
    ctx.fillText(value.toFixed(value < 1 ? 4 : 2), padding.left - 10, y + 4)
  }

  // Calculate candle width - WIDER CANDLES
  // Use 0.6 for width and 0.4 for spacing to make candles more visible
  const candleWidth = (chartWidth / data.length) * 0.6
  const spacing = (chartWidth / data.length) * 0.4

  // Draw candles
  data.forEach((candle, i) => {
    const x = padding.left + i * (candleWidth + spacing) + spacing / 2

    // Convert values to y coordinates
    const openY =
      padding.top +
      ((paddedMaxY - Number(candle.open)) / paddedRange) * chartHeight
    const closeY =
      padding.top +
      ((paddedMaxY - Number(candle.close)) / paddedRange) * chartHeight
    const highY =
      padding.top +
      ((paddedMaxY - Number(candle.high)) / paddedRange) * chartHeight
    const lowY =
      padding.top +
      ((paddedMaxY - Number(candle.low)) / paddedRange) * chartHeight

    // Draw the wick
    ctx.strokeStyle = candle.open > candle.close ? '#FF4444' : '#44DD44'
    ctx.lineWidth = 1.5 // Slightly thicker wicks
    ctx.beginPath()
    ctx.moveTo(x + candleWidth / 2, highY)
    ctx.lineTo(x + candleWidth / 2, lowY)
    ctx.stroke()

    // Draw the candle body with minimum height of 2px
    const bodyHeight = Math.max(Math.abs(closeY - openY), 2)
    ctx.fillStyle = candle.open > candle.close ? '#FF4444' : '#44DD44'
    ctx.fillRect(x, Math.min(openY, closeY), candleWidth, bodyHeight)

    // Draw outline for better visibility
    ctx.strokeStyle = candle.open > candle.close ? '#FF6666' : '#66FF66'
    ctx.lineWidth = 1
    ctx.strokeRect(x, Math.min(openY, closeY), candleWidth, bodyHeight)
  })

  // X-axis time labels
  ctx.fillStyle = '#AAAAAA'
  // ctx.font = '10px Arial'
  ctx.font = '10px OpenSans'
  ctx.textAlign = 'center'

  // Show fewer x-axis labels to avoid crowding
  const labelInterval = Math.max(1, Math.floor(data.length / 6))
  for (let i = 0; i < data.length; i += labelInterval) {
    const candle = data[i]
    const x =
      padding.left + i * (candleWidth + spacing) + spacing / 2 + candleWidth / 2
    const timestamp = new Date(candle.time)
    // const label = format(timestamp, 'HH:mm')
    const label = timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    ctx.fillText(label, x, height - padding.bottom + 20)
  }

  // Add volume bars (optional)
  if (data[0].volume !== undefined) {
    const maxVolume = Math.max(
      ...data.map((candle) => Number(candle.volume || '0'))
    )
    const volumeHeight = padding.bottom * 0.6

    data.forEach((candle, i) => {
      if (candle.volume === undefined) return

      const x = padding.left + i * (candleWidth + spacing) + spacing / 2
      const volY = height - padding.bottom + 5
      const volHeight = (Number(candle.volume) / maxVolume) * volumeHeight

      ctx.fillStyle =
        candle.open > candle.close
          ? 'rgba(255, 68, 68, 0.5)'
          : 'rgba(68, 221, 68, 0.5)'
      ctx.fillRect(x, volY, candleWidth, volHeight)
    })
  }

  return canvas.toBuffer('image/png')
}

// Function to generate a candlestick chart
async function generateCandlestickChart(
  ohcl: GetTokenTradeOhlcResponse200,
  title: string
) {
  const data = ohcl.data
  const width = 800
  const height = 500
  const padding = { top: 40, right: 60, bottom: 60, left: 80 }

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Fill background
  ctx.fillStyle = '#111111'
  ctx.fillRect(0, 0, width, height)

  // Draw title
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 16px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(title, width / 2, 20)

  // Find min and max values
  const minLow = Math.min(...data.map((candle) => Number(candle.low)))
  const maxHigh = Math.max(...data.map((candle) => Number(candle.high)))
  const valueRange = maxHigh - minLow

  // Add 5% padding to top and bottom
  const paddedMinY = minLow - valueRange * 0.05
  const paddedMaxY = maxHigh + valueRange * 0.05
  const paddedRange = paddedMaxY - paddedMinY

  // Determine chart area
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Draw Y-axis
  ctx.strokeStyle = '#444444'
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top)
  ctx.lineTo(padding.left, height - padding.bottom)
  ctx.stroke()

  // Draw X-axis
  ctx.beginPath()
  ctx.moveTo(padding.left, height - padding.bottom)
  ctx.lineTo(width - padding.right, height - padding.bottom)
  ctx.stroke()

  // Draw Y-axis labels
  ctx.fillStyle = '#AAAAAA'
  ctx.font = '12px Arial'
  ctx.textAlign = 'right'

  // Draw 5 price labels
  for (let i = 0; i <= 5; i++) {
    const value = paddedMinY + paddedRange * (i / 5)
    const y =
      height -
      padding.bottom -
      ((value - paddedMinY) / paddedRange) * chartHeight

    // Draw label
    ctx.fillText(value.toFixed(value < 1 ? 4 : 2), padding.left - 10, y + 4)

    // Draw grid line
    ctx.strokeStyle = '#333333'
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()
  }

  // Calculate candle width
  const candleWidth = (chartWidth / data.length) * 0.8
  const spacing = (chartWidth / data.length) * 0.2

  // Draw candles
  data.forEach((candle, i) => {
    const x = padding.left + i * (candleWidth + spacing) + spacing / 2

    // Convert values to y coordinates
    const openY =
      height -
      padding.bottom -
      ((Number(candle.open) - paddedMinY) / paddedRange) * chartHeight
    const closeY =
      height -
      padding.bottom -
      ((Number(candle.close) - paddedMinY) / paddedRange) * chartHeight
    const highY =
      height -
      padding.bottom -
      ((Number(candle.high) - paddedMinY) / paddedRange) * chartHeight
    const lowY =
      height -
      padding.bottom -
      ((Number(candle.low) - paddedMinY) / paddedRange) * chartHeight

    // Draw the wick
    ctx.strokeStyle = candle.open > candle.close ? '#FF4444' : '#44DD44'
    ctx.beginPath()
    ctx.moveTo(x + candleWidth / 2, highY)
    ctx.lineTo(x + candleWidth / 2, lowY)
    ctx.stroke()

    // Draw the candle body
    ctx.fillStyle = candle.open > candle.close ? '#FF4444' : '#44DD44'
    ctx.fillRect(
      x,
      Math.min(openY, closeY),
      candleWidth,
      Math.abs(closeY - openY) || 1
    )

    // X-axis labels (only show some to avoid overcrowding)
    if (i % Math.max(1, Math.floor(data.length / 8)) === 0) {
      const timestamp = new Date(candle.time)
      // const label = format(timestamp, 'MM/dd HH:mm')
      const label = `${
        timestamp.getMonth() + 1
      }/${timestamp.getDate()} ${timestamp.getHours()}:${String(
        timestamp.getMinutes()
      ).padStart(2, '0')}`

      ctx.fillStyle = '#AAAAAA'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(label, x + candleWidth / 2, height - padding.bottom + 20)
    }
  })

  return canvas.toBuffer('image/png')
}
