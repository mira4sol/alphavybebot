import * as crypto from 'crypto'

/**
 * Encrypts a Solana private key using AES-GCM encryption
 * @param privateKey - The Solana private key to encrypt (as string)
 * @param encryptionKey - The key used for encryption (should be securely stored)
 * @returns An object containing the encrypted data, initialization vector, and auth tag
 */
export async function encryptSolanaPrivateKey(
  privateKey: string,
  encryptionKey: string,
  telegramId: string
): Promise<{
  encryptedKey: string
  iv: string
  authTag: string
}> {
  // Validate inputs
  if (!privateKey || !encryptionKey) {
    throw new Error('Private key and encryption key are required')
  }

  // Generate a secure initialization vector
  const iv = crypto.randomBytes(16)

  // Create a composite key using the master key and user's Telegram ID
  // This ensures each user has a unique encryption key
  const compositeKeyMaterial = encryptionKey + ':' + telegramId

  // Derive an encryption key using PBKDF2 (Password-Based Key Derivation Function 2)
  const salt = crypto.randomBytes(16)
  const derivedKey = crypto.pbkdf2Sync(
    compositeKeyMaterial,
    salt,
    100000,
    32,
    'sha256'
  )

  // Create cipher using AES-GCM mode
  const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv)

  // Encrypt the private key
  let encryptedData = cipher.update(privateKey, 'utf8', 'hex')
  encryptedData += cipher.final('hex')

  // Get the authentication tag
  const authTag = cipher.getAuthTag().toString('hex')

  return {
    encryptedKey: encryptedData + ':' + salt.toString('hex'),
    iv: iv.toString('hex'),
    authTag,
  }
}

/**
 * Decrypts a Solana private key that was encrypted using AES-GCM
 * @param encryptedData - The encrypted data from the encryption function
 * @param iv - The initialization vector used during encryption
 * @param authTag - The authentication tag from encryption
 * @param encryptionKey - The key used for encryption
 * @returns The decrypted Solana private key
 */
export async function decryptSolanaPrivateKey(
  encryptedData: string,
  iv: string,
  authTag: string,
  encryptionKey: string,
  telegramId: string
): Promise<string> {
  // Validate inputs
  if (!encryptedData || !iv || !authTag || !encryptionKey) {
    throw new Error('Missing required decryption parameters')
  }

  // Split the encrypted data and salt
  const [encryptedKey, saltHex] = encryptedData.split(':')

  // Convert hex strings back to buffers
  const ivBuffer = Buffer.from(iv, 'hex')
  const authTagBuffer = Buffer.from(authTag, 'hex')
  const salt = Buffer.from(saltHex, 'hex')

  // Create the same composite key used for encryption
  const compositeKeyMaterial = encryptionKey + ':' + telegramId

  // Derive the same key used for encryption
  const derivedKey = crypto.pbkdf2Sync(
    compositeKeyMaterial,
    salt,
    100000,
    32,
    'sha256'
  )

  // Create decipher using AES-GCM mode
  const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, ivBuffer)

  // Set auth tag for verification
  decipher.setAuthTag(authTagBuffer)

  // Decrypt the data
  let decryptedData = decipher.update(encryptedKey, 'hex', 'utf8')
  decryptedData += decipher.final('utf8')

  return decryptedData
}
