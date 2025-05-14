export interface UserSession {
  waitingForInput: boolean
  inputType?:
    | 'buy_amount'
    | 'sell_amount'
    | 'auto_buy_amount'
    | 'buy_config_left'
    | 'buy_config_right'
    | 'sell_config_partial'
    | 'sell_config_full'
  tokenMint?: string
  lastMessageId?: number
  lastCallbackId?: string
}

export interface SessionStore {
  [userId: string]: UserSession
}
