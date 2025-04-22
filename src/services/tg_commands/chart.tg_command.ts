import { tgDeleteButton } from '@/utils/constants/tg.constants'
import { vybeFYITokenLink } from '@/utils/links.util'
import { vybeApi } from '@/utils/platform'
import { isValidSolanaAddress } from '@/utils/solana.lib'
import { GetTokenTradeOhlcResponse200 } from '@api/vybe-api'
import { createCanvas } from '@napi-rs/canvas'
import { Context } from 'telegraf'

const LOG_NAME = '[ChartCommand::Message]'

export const chartCommand = async (ctx: Context) => {
  let deleteMessageId = 0
  try {
    const wallet_address = ctx.text?.split(' ')[1]

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
      reply_markup: {
        inline_keyboard: [tgDeleteButton],
      },
    })
    const token_ohlc = token_ohlc_req.data
    console.log('token_ohlc', token_ohlc)

    if (token_ohlc.data.length === 0) {
      return ctx.reply('❌ No chart data available yet', {
        reply_parameters: { message_id: ctx?.msgId || 0 },
        reply_markup: {
          inline_keyboard: [tgDeleteButton],
        },
      })
    }

    const chartBuffer = await generateCandlestickChart(token_ohlc, '')

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
