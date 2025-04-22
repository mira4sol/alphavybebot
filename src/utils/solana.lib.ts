import {
  Cluster,
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'
import bs58 from 'bs58'

export const SOLANA_ADDRESSES = {
  SYSTEM_PROGRAM: '11111111111111111111111111111111',
  WSOL_MINT: 'So11111111111111111111111111111111111111112',
}

export const sendNativeSol = async (
  connection: Connection,
  {
    amount,
    fromPubkey,
    toPubkey,
  }: {
    amount: number
    fromPubkey: PublicKey
    toPubkey: PublicKey
  }
) => {
  try {
    // ensure the receiving account will be rent exempt
    const minimumBalance = await connection.getMinimumBalanceForRentExemption(
      0 // note: simple accounts that just store native SOL have `0` bytes of data
    )

    if (amount < minimumBalance) {
      throw new Error(`account may not be rent exempt: ${toPubkey.toBase58()}`)
      // return Response.json({
      //   error: `account may not be rent exempt: ${toPubkey.toBase58()}`,
      // })
    }

    // create an instruction to transfer native SOL from one wallet to another
    const transferSolInstruction = SystemProgram.transfer({
      fromPubkey: fromPubkey,
      toPubkey: toPubkey,
      lamports: amount,
    })

    // get the latest blockhash amd block height
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash()

    // create a legacy transaction
    const transaction = new Transaction({
      feePayer: fromPubkey,
      blockhash,
      lastValidBlockHeight,
    }).add(transferSolInstruction)

    // const transaction = new Transaction().add(
    //   SystemProgram.transfer({
    //     fromPubkey: fromPubkey,
    //     toPubkey: toPubkey,
    //     lamports: amount,
    //   })
    // )
    // transaction.feePayer = fromPubkey
    // transaction.recentBlockhash = (
    //   await connection.getLatestBlockhash()
    // ).blockhash
    // transaction.lastValidBlockHeight = (
    //   await connection.getLatestBlockhash()
    // ).lastValidBlockHeight

    return transaction
  } catch (error: any) {
    throw new Error(error.message || 'Unknown error occurred')
  }
}

export const connection = async (cluster: Cluster = 'mainnet-beta') =>
  new Connection(clusterApiUrl(cluster))

export const isValidSolanaAddress = (address: string): boolean => {
  try {
    if (!address) return false

    if (address === SOLANA_ADDRESSES.SYSTEM_PROGRAM) return true

    const decoded = bs58.decode(address)

    // Solana public keys are 32 bytes long
    return decoded.length === 32
  } catch {
    return false
  }
}

export const isValidBase58PrivateKey = (key: string): boolean => {
  try {
    const decoded = bs58.decode(key.trim())
    return decoded.length === 64 // Solana private key is 64 bytes
  } catch {
    return false
  }
}
