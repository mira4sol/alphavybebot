export const isMintAddress = (address: string) => {
  // Solana addresses are 32-44 characters long and contain only base58 characters
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

  return solanaAddressRegex.test(address)
}
