export interface JupiterQuoteParams {
  inputMint: string
  outputMint: string
  amount: number
  slippageBps: number
}

export interface JupiterQuoteResponse {
  inputMint: string
  inAmount: string
  outputMint: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: 'ExactIn' | 'ExactOut'
  slippageBps: number
  platformFee: null | any
  priceImpactPct: string
  routePlan: RoutePlan[]
  contextSlot: number
  timeTaken: number
}

interface RoutePlan {
  swapInfo: SwapInfo
  percent: number
}

interface SwapInfo {
  ammKey: string
  label: string
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  feeAmount: string
  feeMint: string
}

export interface PriorityLevel {
  maxLamports: number
  priorityLevel: 'veryHigh' | 'high' | 'medium' | 'low'
}

export interface JupiterSwapParams {
  quoteResponse: JupiterQuoteResponse
  userPublicKey: string
  dynamicComputeUnitLimit?: boolean
  dynamicSlippage?: boolean
  prioritizationFeeLamports?: {
    priorityLevelWithMaxLamports: PriorityLevel
  }
}

// ...existing code...

interface ComputeBudget {
  microLamports: number
  estimatedMicroLamports: number
}

interface PrioritizationType {
  computeBudget: ComputeBudget
}

interface DynamicSlippageReport {
  slippageBps: number
  otherAmount: number
  simulatedIncurredSlippageBps: number
  amplificationRatio: string
  categoryName: string
  heuristicMaxSlippageBps: number
}

export interface JupiterSwapResponse {
  swapTransaction: string
  lastValidBlockHeight: number
  prioritizationFeeLamports: number
  computeUnitLimit: number
  prioritizationType: PrioritizationType
  dynamicSlippageReport: DynamicSlippageReport
  simulationError: null | string
}
