import { ENV } from '@/utils/constants/env.constants'
import { Keypair } from '@solana/web3.js'
import {
  decryptSolanaPrivateKey,
  encryptSolanaPrivateKey,
} from '../utils/encryptions.helper'
import { prisma } from '../utils/prisma.helper'

export class WalletModel {
  static async findWallet(telegram_id: string) {
    try {
      // Get the user with wallet info
      let wallet = await prisma.wallet.findFirst({
        where: { telegram_id },
      })

      if (!wallet) {
        const keypair = Keypair.generate()
        const privateKey = Buffer.from(keypair.secretKey).toString('hex')
        const publicKey = keypair.publicKey.toString()

        if (!ENV.ENCRYPTION_KEY) throw new Error('Encryption key missing')

        // Encrypt the private key
        const encryptedKeyData = await encryptSolanaPrivateKey(
          privateKey,
          ENV.ENCRYPTION_KEY,
          telegram_id
        )

        wallet = await prisma.wallet.create({
          data: {
            telegram_id,
            public_key: publicKey,
            private_key: encryptedKeyData.encryptedKey,
            iv: encryptedKeyData.iv,
            authTag: encryptedKeyData.authTag,
          },
        })
      }

      return wallet
    } catch (error) {
      console.error('Error creating wallet:', error)
      throw error
    }
  }

  static async decryptWalletKey(telegram_id: string) {
    try {
      // Get the user with wallet info
      let wallet = await this.findWallet(telegram_id)
      if (!wallet) throw new Error('Wallet not found')

      // Decrypt the private key
      const decryptedKey = await decryptSolanaPrivateKey(
        wallet.private_key,
        wallet.iv,
        wallet.authTag,
        ENV.ENCRYPTION_KEY,
        telegram_id
      )

      return decryptedKey
    } catch (error) {
      console.error('Error creating wallet:', error)
      throw error
    }
  }
}
