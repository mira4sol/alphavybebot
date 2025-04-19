export const calculatePriceChange = (
  currentPrice: number,
  comparedPrice: number
): number => {
  if (!currentPrice || !comparedPrice) return 0
  return ((currentPrice - comparedPrice) / comparedPrice) * 100
}

export const calculatePriceChangeWithSymbol = (
  currentPrice: number,
  previousPrice: number
): string => {
  if (!currentPrice || !previousPrice) return '0%'

  const percentageChange = calculatePriceChange(currentPrice, previousPrice)
  const sign = percentageChange > 0 ? '+' : ''
  return `${sign}${percentageChange.toFixed(2)}%`
}

export const calculatePriceMultiplier = (
  currentPrice: number,
  entryPrice: number
): string => {
  if (!currentPrice || !entryPrice) return '0x'

  const multiplier = currentPrice / entryPrice

  // For losses (multiplier < 1)
  if (multiplier < 1) {
    return `${multiplier.toFixed(2)}x`
  }

  // For gains (multiplier > 1)
  if (multiplier >= 100) {
    return `${Math.round(multiplier)}x` // Round to nearest whole number for large gains
  }

  return `${multiplier.toFixed(1)}x` // One decimal place for normal gains
}

export const calculateX = (
  currentPrice: number,
  entryPrice: number
): number => {
  if (!currentPrice || !entryPrice) return 0
  return currentPrice / entryPrice - 1
}

export const calculatePriceMultiplierWithEmoji = (
  currentPrice: number,
  entryPrice: number
): string => {
  if (!currentPrice || !entryPrice) return '0x (0%)'

  // Calculate how many times the price has increased/decreased
  const multiplier = calculateX(currentPrice, entryPrice)

  const percentageChange = calculatePriceChange(
    currentPrice,
    entryPrice
  ).toFixed(2)

  // For losses (when current < entry)
  if (multiplier < 0) {
    const formattedMultiplier = Math.abs(multiplier).toFixed(2)
    return `-${formattedMultiplier}x ${
      Math.floor(Math.random() * 2) + 1 === 1 ? '🥹' : '😭'
    }`
  }

  // For breakeven
  if (multiplier === 0) {
    return `0x 😐`
  }

  // For gains
  const formattedMultiplier = multiplier.toFixed(2)

  if (multiplier <= 1) {
    return `${formattedMultiplier}x 🔥`
  }

  // Different emoji based on multiplier
  let emoji = '📈'
  if (multiplier >= 1) emoji = '🚀' // 2x or more (100%+ gain)
  if (multiplier >= 5) emoji = '🌙' // 6x or more (500%+ gain)

  return `${formattedMultiplier}x ${emoji}`
}
