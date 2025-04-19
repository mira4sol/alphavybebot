import { VybeSocketMessage } from '@/types'

export const vybeWssCustomMessageHandler = (message: VybeSocketMessage) => {
  // Custom processing logic
  // console.log('Custom handler received message:', message)

  // This is a VybeTradesSocketMessage
  if ('authorityAddress' in message && 'marketId' in message) {
    handleTradesMessages(message)
  }
  // This is a VybeTransferSocketMessage
  else if ('receiverAddress' in message && 'senderAddress' in message) {
    handleTransferMessages(message)
  }
  // This is a VybeOraclePrice
  else if ('priceFeedAccount' in message && 'price' in message) {
    console.log('Oracle price message:', message)
  } else {
    console.log('Unknown message type:', message)
  }
}

const handleTradesMessages = (message: VybeSocketMessage) => {
  // Handle trade messages
  console.log('Trade message:', message)
}

const handleTransferMessages = (message: VybeSocketMessage) => {
  // Handle transfer messages
  console.log('Transfer message:', message)
}

const handleOraclePriceMessages = (message: VybeSocketMessage) => {
  // Handle oracle price messages
  console.log('Oracle price message:', message)
}
