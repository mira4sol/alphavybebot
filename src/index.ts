import express from 'express'
import http from 'http'
import 'reflect-metadata' // Used so that we can run this script directly from ts-node
import { startCronJobs, stopCronJobs } from './cron/scheduler'
import { injectMiddleWares } from './middlewares'
import { registerRoutes } from './routes'
import { vybeWssCustomMessageHandler } from './services/vybe-socket.service'
import { setupFont } from './utils/canvas.util'
import { ENV } from './utils/constants/env.constants'
import { appLogger } from './utils/logger.util'
import { prisma } from './utils/prisma.helper'
import {
  availableTradesPrograms,
  VybeWebSocket,
} from './utils/vybesocket-client'

let server: http.Server
let wsClient: VybeWebSocket | null = null

/**
 * The `bootstrap` function initializes a server using Express, initializes a database using Sequelize,
 * sets up middleware, registers routes, and starts the server listening on a specified port.
 */
const bootstrap = async () => {
  const app = express()

  const PORT = ENV.PORT || 5000

  await setupFont()
  injectMiddleWares(app)
  registerRoutes(app)

  server = app.listen(PORT, () => {
    appLogger.log('info', `Server running at PORT: ${PORT}`)
  })

  server.on('error', (error) => {
    // gracefully handle error
    throw new Error(error.message)
  })

  await prisma.$connect().catch((error) => {
    appLogger.log('error', `Error connecting to database: ${error}`)
    process.exit(1)
  })

  // Start cron jobs
  startCronJobs()

  // run initial scripts
  // runInitialScripts()

  wsClient = new VybeWebSocket({
    websocketUri: 'wss://api.vybenetwork.xyz/live',
    apiKey: ENV.VIBE_API_KEY || '',
    configureMessage: {
      type: 'configure',
      filters: {
        trades: [
          { programId: availableTradesPrograms.RAYDIUM_V4 },
          { programId: availableTradesPrograms.RAYDIUM_CLMM },
          { programId: availableTradesPrograms.PUMP_FUN },
        ],
        transfers: [],
      },
    },
    onMessage: vybeWssCustomMessageHandler,
    onConnect: () => appLogger.log('info', 'Successfully connected!'),
    onError: (error) => {
      console.error('Custom error handler:', error)
      appLogger.log('error', `Error connecting to Vybe: ${error}`)
    },
  })

  wsClient.connect()
}

const cleanup = async () => {
  appLogger.log('info', 'Cleaning up resources...')

  // Stop cron jobs
  stopCronJobs()

  // Disconnect WebSocket
  if (wsClient) {
    try {
      wsClient.disconnect()
      // Force close the WebSocket connection
      if (wsClient['ws']) {
        wsClient['ws'].terminate()
      }
      wsClient = null
      appLogger.log('info', 'WebSocket connection terminated')
    } catch (error) {
      appLogger.error('Error disconnecting WebSocket:', error)
    }
  }

  // Close database connection
  try {
    await prisma.$disconnect()
    appLogger.log('info', 'Database connection closed')
  } catch (error) {
    appLogger.error('Error disconnecting database:', error)
  }

  // Close HTTP server
  if (server) {
    server.close(() => {
      appLogger.log('info', 'HTTP server closed')
      // Force exit after cleanup
      process.exit(0)
    })
  } else {
    // If server is not available, exit immediately
    process.exit(0)
  }
}

bootstrap()

// Handle graceful shutdown
process.on('SIGTERM', cleanup)
process.on('SIGINT', cleanup)
