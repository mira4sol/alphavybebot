import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { vybeFYITokenLink } from '@/utils/links.util'
import { vybeApi } from '@/utils/platform'
import { isValidSolanaAddress } from '@/utils/solana.lib'
import { GetTokenTradeOhlcResponse200 } from '@api/vybe-api'
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import { Context } from 'telegraf'

const LOG_NAME = '[ChartCommand::Message]'

export const chartCommand = async (ctx: Context) => {
  let deleteMessageId = 0
  try {
    const wallet_address = ctx.text?.split(' ')[1]
    const timeframe = ctx.text?.split(' ')[2]

    if (!wallet_address || !isValidSolanaAddress(wallet_address?.trim())) {
      let txt = `❌ Invalid Input!
     └ Use /wallet <wallet address>, e.g. /wallet 5QDwYS1CtHzN1oJ2eij8Crka4D2eJcUavMcyuvwNRM9`

      return await ctx.reply(txt, {
        reply_parameters: { message_id: ctx?.msgId || 0 },
        reply_markup: {
          inline_keyboard: [tgDeleteButton],
        },
      })
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

    const token_ohlc_req = await vybeApi.get_token_trade_ohlc({
      mintAddress: wallet_address,
      resolution: (timeframe as any) || '1d',
    })
    const token_ohlc = token_ohlc_req.data

    if (token_ohlc.data.length === 0) {
      return ctx.reply('❌ No chart data available yet', {
        reply_parameters: { message_id: ctx?.msgId || 0 },
        reply_markup: {
          inline_keyboard: [tgDeleteButton],
        },
      })
    }

    const chartBuffer = await generateCandlestickChart1(
      token_ohlc,
      '',
      '1d price change'
    )
    // const chartBuffer = await generateCandlestickChart(token_ohlc, '')

    const caption = `📊 Chart Information
${vybeFYITokenLink('Advance Analyses with vybe', wallet_address)}`

    await ctx.replyWithPhoto(
      { source: chartBuffer },
      {
        caption,
        parse_mode: 'Markdown',
        reply_parameters: { message_id: ctx?.msgId || 0 },
        reply_markup: {
          inline_keyboard: [tgDeleteButton],
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
    await ctx.reply('❌ Oh chim 🥹\n' + msg, {
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
