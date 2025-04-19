import { EncryptionHelper } from '../utils/encryptions.helper'
import { prisma } from '../utils/prisma.helper'

export async function createUserWallet(telegram_id: string) {
  try {
    const keypair = EncryptionHelper.generateSolanaKeypair()
    const encryptedPrivateKey = EncryptionHelper.encrypt(keypair.privateKey)

    const wallet = await prisma.wallet.create({
      data: {
        telegram_id,
        public_key: keypair.publicKey,
        private_key: encryptedPrivateKey,
      },
    })

    return wallet
  } catch (error) {
    console.error('Error creating wallet:', error)
    throw error
  }
}
