import CryptoJS from 'crypto-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const { AES_KEY } = process.env
// Do not forget trailing space
const { PREFIX } = process.env + ' '

console.log('AES_KEY:', AES_KEY)
console.log('PREFIX:', PREFIX)

// checks for the env variables
if (!PREFIX) throw new Error('[DECRYPT] AES_KEY is not defined in the environment variables')
if (!PREFIX) throw new Error('[DECRYPT] PREFIX is not defined in the environment variables')

/**
 * Decrypt the encrypted content using AES with a predefined key and prefix.
 * @param {string} encryptedContent - The encrypted content to decrypt.
 * @returns {object|null} - The decrypted object, or null if decryption fails.
 */
function decryptContent(encryptedContent) {
  console.log('[DECRYPT] Starting decryption process...')
  console.log('[DECRYPT] Encrypted content:', encryptedContent)

  try {
    if (encryptedContent.startsWith(PREFIX)) {
      console.log('[DECRYPT] Prefix found, removing prefix...')
      encryptedContent = encryptedContent.slice(PREFIX.length)
    }

    console.log('[DECRYPT] Content after removing prefix:', encryptedContent)

    const decrypted = CryptoJS.AES.decrypt(encryptedContent, AES_KEY)
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)

    console.log('[DECRYPT] Decrypted text:', decryptedText)

    const decryptedObject = JSON.parse(decryptedText)
    console.log('[DECRYPT] Decrypted object:', decryptedObject)

    return decryptedObject
  } catch (error) {
    console.error('[DECRYPT] Decryption failed:', error)
    return null
  }
}

export { decryptContent }
