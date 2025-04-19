// const WebSocket = require('ws') // `npm install ws` or `yarn add ws` to install the ws package
import { VybeSocketMessage, VybeWebSocketConfig } from '@/types'
import WebSocketInstance from 'ws'
import { appLogger } from './logger.util'

export const availableTradesPrograms = {
  METEORA_DLMM: 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo',
  METEORA_POOLS: 'Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB',
  LIFINITY_SWAP_V2: '2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c',
  LIFINITY_SWAP_V1: 'EewxydAPCCVuNEyrVN68PuSYdQ7wKn27V9Gjeoi8dy3S',
  OPENBOOK_V2: 'opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb',
  RAYDIUM_V4: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
  RAYDIUM_CLMM: 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK',
  RAYDIUM_CPMM: 'CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C',
  ORCA_WHIRPOOL: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
  PHOENIX: 'PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY',
  PUMP_FUN: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
} // We are actively working to add more programs to the list. If you need a specific program, please reach out to us.

export class VybeWebSocket {
  private ws: WebSocketInstance | null = null
  private reconnectAttempts = 0
  private readonly config: Required<VybeWebSocketConfig>
  private reconnectTimeout?: NodeJS.Timeout

  constructor(config: VybeWebSocketConfig) {
    // Default configuration
    this.config = {
      websocketUri: config.websocketUri,
      apiKey: config.apiKey,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 1000,
      baseReconnectDelay: config.baseReconnectDelay ?? 1000,
      reconnect: config.reconnect ?? true,
      configureMessage: config.configureMessage ?? {
        type: 'configure',
        filters: {
          trades: [
            {
              programId: availableTradesPrograms.RAYDIUM_V4,
            },
          ],
        },
      },
      onMessage: config.onMessage ?? this.defaultMessageHandler.bind(this),
      onConnect:
        config.onConnect ?? (() => console.log('Connected to WebSocket')),
      onDisconnect:
        config.onDisconnect ??
        (() => console.log('Disconnected from WebSocket')),
      onError:
        config.onError ??
        ((error: Error) => console.error('WebSocket error:', error)),
    }
  }

  public connect(): void {
    try {
      // Subscribe to Business or Premium plan here for Websocket API access - https://alpha.vybenetwork.com/api-plans - generate API key and get websocket URI here https://alpha.vybenetwork.com/dashboard/api-management
      this.ws = new WebSocketInstance(this.config.websocketUri, {
        headers: { 'X-API-Key': this.config.apiKey },
      })
      this.setupEventListeners()
    } catch (error) {
      this.config.onError(error as Error)
      this.handleReconnect()
    }
  }

  public disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    this.ws?.close()
    this.ws = null
    this.reconnectAttempts = 0
  }

  private setupEventListeners(): void {
    if (!this.ws) return

    this.ws.on('open', this.handleOpen.bind(this))
    this.ws.on('message', this.handleMessage.bind(this))
    this.ws.on('close', this.handleClose.bind(this))
    this.ws.on('error', this.handleError.bind(this))
  }

  private handleOpen(): void {
    this.reconnectAttempts = 0
    this.sendConfigureMessage()
    this.config.onConnect()
  }

  private handleMessage(message: WebSocketInstance.Data): void {
    try {
      const parsedMessage = JSON.parse(message.toString())
      this.config.onMessage(parsedMessage)
    } catch (error) {
      this.config.onError(new Error(`Failed to parse message: ${error}`))
    }
  }

  private handleClose(): void {
    this.config.onDisconnect()
    this.handleReconnect()
  }

  private handleError(error: Error): void {
    appLogger.error('VibeSocketError]', `WebSocket error: ${error}`)
    this.config.onError(error)
    this.handleReconnect()
  }

  private handleReconnect(): void {
    if (!this.config.reconnect) return

    // if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
    //   this.config.onError(new Error('Max reconnection attempts reached'))
    //   return
    // }

    const delay =
      this.config.baseReconnectDelay * Math.pow(2, this.reconnectAttempts)
    console.log(`Attempting to reconnect in ${delay}ms...`)

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++
      this.connect()
    }, delay)
  }

  private sendConfigureMessage(): void {
    if (!this.ws) return
    this.ws.send(JSON.stringify(this.config.configureMessage))
  }

  private defaultMessageHandler(message: VybeSocketMessage): void {
    // console.log(
    //   `Trade: ${message.baseSize} tokens for ${message.quoteSize} USDC ` +
    //     `at price ${message.price}, signature: ${message.signature}`
    // )
  }
}
