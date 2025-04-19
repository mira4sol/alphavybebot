import * as web3 from '@solana/web3.js'
import bs58 from 'bs58'
import * as crypto from 'crypto'
import { ENV } from './constants/env.constants'

const ENCRYPTION_KEY = crypto
  .createHash('sha256')
  .update(ENV.ENCRYPTION_KEY || '')
  .digest()

const IV_LENGTH = 16

export class EncryptionHelper {
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH)

    if (!ENV.ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY is not set')

    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(ENCRYPTION_KEY),
      iv
    )
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ])
    const authTag = cipher.getAuthTag()

    return Buffer.concat([iv, authTag, encrypted]).toString('base64')
  }

  static decrypt(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, 'base64')
    const iv = buffer.slice(0, IV_LENGTH)
    const authTag = buffer.slice(IV_LENGTH, IV_LENGTH + 16)
    const encrypted = buffer.slice(IV_LENGTH + 16)

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(ENCRYPTION_KEY),
      iv
    )
    decipher.setAuthTag(authTag)

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8')
  }

  static generateSolanaKeypair() {
    const keypair = web3.Keypair.generate()
    return {
      publicKey: keypair.publicKey.toString(),
      privateKey: bs58.encode(keypair.secretKey),
    }
  }
}
