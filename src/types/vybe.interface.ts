// Types for configuration and messages
export interface VybeTradeFilter {
  tokenMintAddress?: string
  feePayer?: string
  programId?: string
  authorityAddress?: string
  marketId?: string
  quoteMintAddress?: string
  baseMintAddress?: string
}

export interface VybeTransferFilter {
  feePayer?: string
  minAmount?: number
  maxAmount?: number
  programId?: string
  receiverAddress?: string
  receiverTokenAccount?: string
  senderAddress?: string
  senderTokenAccount?: string
  tokenMintAddress?: string
}

export interface VybeOraclePriceFilter {
  priceFeedAccount?: string
  productAccount?: string
}

export interface VybeConfigureMessage {
  type: 'configure'
  filters: {
    trades?: VybeTradeFilter[]
    transfers?: VybeTransferFilter[]
    oraclePrices?: VybeOraclePriceFilter[]
  }
}

export interface VybeTradesSocketMessage {
  authorityAddress: string
  blockTime: number
  iixOrdinal: number
  baseMintAddress: string
  interIxOrdinal: number
  ixOrdinal: number
  marketId: string
  quoteMintAddress: string
  price: string
  programId: string
  signature: string
  slot: number
  txIndex: number
  fee: string
  feePayer: string
  baseSize: string
  quoteSize: string
}

export interface VybeTransferSocketMessage {
  signature: string
  callingPrograms: string[]
  senderTokenAccount: string | null
  senderAddress: string
  receiverTokenAccount: string | null
  receiverAddress: string
  mintAddress: string
  feePayer: string
  decimal: number
  amount: number
  slot: number
  blockTime: number
  id: number[]
}

export interface VybeOraclePriceMessage {
  priceFeedAccount: string
  lastUpdated: number
  validSlot: number
  price: string
  confidence: string
  emac1H: string
  emap1H: string
}

export type VybeSocketMessage =
  | VybeTradesSocketMessage
  | VybeTransferSocketMessage
  | VybeOraclePriceMessage

// Configuration options for the WebSocket client
export interface VybeWebSocketConfig {
  websocketUri: string
  apiKey: string
  maxReconnectAttempts?: number
  baseReconnectDelay?: number
  configureMessage?: VybeConfigureMessage
  reconnect?: boolean
  onMessage?: (message: VybeSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}
