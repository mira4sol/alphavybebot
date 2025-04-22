import { VybeSocketMessage } from '@/types'
import { handleOraclePriceMessages } from './ws_messages/oracle.vybe_message'
import { handleTradesMessages } from './ws_messages/trades.vybe_message'
import { handleTransferMessages } from './ws_messages/transfer.vybe_message'

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
    handleOraclePriceMessages(message)
  } else {
    console.log('Unknown message type:', message)
  }
}
