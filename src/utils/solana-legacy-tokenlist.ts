import { promises as fs } from 'fs'
import path from 'path'

let cachedTokenList: any = null

// Function to load the token list dynamically
const loadTokenList = async () => {
  if (!cachedTokenList) {
    const filePath = path.resolve(
      __dirname,
      '../../assets/solana.tokenlist.json'
    )
    const data = await fs.readFile(filePath, 'utf-8')
    cachedTokenList = JSON.parse(data)
  }
  return cachedTokenList
}

// Function to find a token by address, name, or symbol
export const findToken = async (query: string) => {
  const tokenList = await loadTokenList()
  return tokenList.tokens.find(
    (token: any) =>
      token.address === query ||
      token.name?.toLowerCase() === query.toLowerCase() ||
      token.symbol?.toLowerCase() === query.toLowerCase()
  )
}
