import { decryptContent } from './decrypt.js'
import { updateToken } from './db'

/**
 * Main function to handle the update of service token.
 * @param {import('@vercel/node').VercelRequest} req - The incoming HTTP request.
 * @param {import('@vercel/node').VercelResponse} res - The outgoing HTTP response.
 */
export default async function handler(req, res) {
  console.log('[API] Request method:', req.method)

  // Allow only POST requests
  if (req.method !== 'POST') {
    console.log('[API] Method not allowed:', req.method)
    return res.status(405).json({ message: 'Only POST requests are allowed' })
  }

  const { service_name, token } = req.body
  console.log('[API] Request body:', req.body)

  // Validate required fields
  if (!service_name || !token) {
    console.log('[API] Missing required fields:', { service_name, token })
    return res.status(400).json({ message: 'Service name and token are required' })
  }

  try {
    console.log('[API] Decrypting token...')
    const decryptedData = decryptContent(token)

    if (!decryptedData || !decryptedData.cookies || !decryptedData.url) {
      console.log('[API] Invalid token data:', decryptedData)
      return res.status(400).json({ message: 'Invalid token data' })
    }

    const { cookies, url } = decryptedData

    console.log('[API] Updating service with decrypted data...')
    const updatedData = { service_url: url, cookies }

    const result = await updateToken(service_name, updatedData)
    console.log('[API] Update result:', result)

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Service not found' })
    }

    return res.status(200).json({
      message: 'Service updated successfully',
      data: { service_name, ...updatedData }
    })
  } catch (error) {
    console.error('[API] Error handling request:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
