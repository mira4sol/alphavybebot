import { escapeTelegramChar } from './telegram.helpers'

export const escapeMarkdown = (text: string) => {
  return text.replace(/([\\_*`|!.[\](){}>+#=~-])/gm, '\\$1')
}

export const formatDecimalPrice = (
  price: string | number,
  fixedPoints: number = 2
) => {
  try {
    // Convert to number first to handle any string inputs
    const numPrice = typeof price === 'string' ? parseFloat(price) : price

    // Check if it's a valid number
    if (isNaN(numPrice)) {
      return '0'
    }

    // Format to specified decimal places and remove trailing zeros
    const formatted = numPrice.toFixed(fixedPoints)
    // Remove trailing zeros after decimal point and remove decimal point if no decimals
    return formatted.replace(/\.?0+$/, '')
  } catch (error) {
    return '0'
  }
}

export const formatLongNumber = (
  num: number,
  escapeTgChar?: boolean
): string => {
  const lookup = [
    { value: 1e9, symbol: 'B' }, // Billion
    { value: 1e6, symbol: 'M' }, // Million
    { value: 1e3, symbol: 'K' }, // Thousand
  ]

  const match = lookup.find((item) => Math.abs(num) >= item.value)

  if (match) {
    // Calculate the value first without rounding
    const value = num / match.value
    // Round to 2 decimal places after division
    const rounded = Math.floor(value * 100) / 100
    // Convert to string and conditionally format decimals
    const strValue = rounded.toString()

    // If it has decimals and second decimal is not 0, keep both decimals
    if (strValue.includes('.')) {
      const [whole, decimal] = strValue.split('.')
      if (decimal.length === 2 && decimal[1] !== '0') {
        if (escapeTgChar) return escapeTelegramChar(strValue + match.symbol)
        return strValue + match.symbol
      }

      const result =
        (Math.floor(value * 10) / 10).toString().replace(/\.0$/, '') +
        match.symbol

      // If second decimal is 0 or doesn't exist, keep only first decimal
      if (escapeTgChar) return escapeTelegramChar(result)
      return result
    }

    if (escapeTgChar) return escapeTelegramChar(strValue + match.symbol)

    return strValue + match.symbol
  }

  if (escapeTgChar) return escapeTelegramChar(num.toString())

  return num.toString()
}
