import CryptoJS from 'crypto-js'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Fetch environment variables (with fallbacks for debugging)
const AES_KEY = process.env.AES_KEY || 'ScholarsBureau(created-by-www.scholarsbureau.com)iLFB0yJSdidhLStH6tNcfXMqo7L8qkdofk'
const PREFIX = process.env.PREFIX || 'ScholarsBureau(created-by-www.scholarsbureau.com)'
const prefixWithSpace = PREFIX + ' '

// Log AES_KEY and prefixWithSpace for debugging purposes (remove in production for security)
console.log('[DECRYPT] AES_KEY:', AES_KEY ? '[PROVIDED]' : '[DEFAULT]')
console.log('[DECRYPT] prefixWithSpace:', prefixWithSpace ? '[PROVIDED]' : '[DEFAULT]')

// Validate environment variables (ensure they exist and are not empty)
if (!AES_KEY) {
  throw new Error('[DECRYPT] AES_KEY is not defined in the environment variables')
}
if (!prefixWithSpace) {
  throw new Error('[DECRYPT] prefixWithSpace is not defined or is empty in the environment variables')
}

/**
 * Decrypt the encrypted content using AES with a predefined key and prefix.
 * @param {string} encryptedContent - The encrypted content to decrypt.
 * @returns {object|null} - The decrypted object, or null if decryption fails.
 */
function decryptContent(encryptedContent) {
  console.log('[DECRYPT] Starting decryption process...')

  // Validate encrypted content
  if (typeof encryptedContent !== 'string' || encryptedContent.trim() === '') {
    console.error('[DECRYPT] Invalid or empty encrypted content provided.')
    return null
  }

  console.log('[DECRYPT] Encrypted content:', encryptedContent)

  try {
    // Remove prefix if it exists
    if (encryptedContent.startsWith(prefixWithSpace)) {
      console.log('[DECRYPT] Prefix found, removing prefix...')
      encryptedContent = encryptedContent.slice(prefixWithSpace.length)
    }

    console.log('[DECRYPT] Content after removing prefix:', encryptedContent)

    // Perform decryption
    const decrypted = CryptoJS.AES.decrypt(encryptedContent, AES_KEY)
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)

    // Check if decryption resulted in valid text
    if (!decryptedText) {
      console.error('[DECRYPT] Decryption failed. The decrypted text is empty.')
      return null
    }

    console.log('[DECRYPT] Decrypted text:', decryptedText)

    // Parse the decrypted text into an object
    const decryptedObject = JSON.parse(decryptedText)
    console.log('[DECRYPT] Decrypted object:', decryptedObject)

    return decryptedObject
  } catch (error) {
    // Log detailed error message
    console.error('[DECRYPT] Decryption failed:', error.message)
    return null
  }
}

export { decryptContent }
