import { insertService } from './db.js'
import { decryptContent } from './decrypt.js'

/**
 * Main function to handle the insertion of service data.
 * @param {import('@vercel/node').VercelRequest} req - The incoming HTTP request.
 * @param {import('@vercel/node').VercelResponse} res - The outgoing HTTP response.
 */
export default async function handler(req, res) {
  console.log('[API] Received request:', {
    method: req.method,
    url: req.url,
    headers: req.headers
  })

  // Ensure the request is a POST request
  if (req.method !== 'POST') {
    console.log('[API] Invalid request method:', req.method)
    return res.status(405).json({ message: 'Only POST requests are allowed' })
  }

  // Extract service data from the request body
  const { service_name, service_desc, token } = req.body
  console.log('[API] Request body:', { service_name, service_desc, token })

  // Validate required fields
  if (!service_name || !service_desc || !token) {
    console.error('[API] Missing required fields:', { service_name, service_desc, token })
    return res.status(400).json({ message: 'Service name, description, and token are required' })
  }

  try {
    console.log('[API] Decrypting token...')

    // Decrypt the token to retrieve service data
    const decryptedData = decryptContent(token)

    // Validate the decrypted data
    if (!decryptedData || !decryptedData.cookies || !decryptedData.url) {
      console.error('[API] Invalid or incomplete decrypted data:', decryptedData)
      return res.status(400).json({ message: 'Invalid or incomplete token data' })
    }

    const { cookies, url } = decryptedData

    // Prepare service data to be inserted into the database
    const serviceData = {
      service_name,
      service_desc,
      service_url: url,
      cookies
    }

    console.log('[API] Service data prepared for insertion:', serviceData)

    // Insert the service into the database
    const result = await insertService(serviceData)
    console.log('[API] Service successfully inserted, result:', result)

    // Respond with success message and inserted service data
    return res.status(200).json({
      message: 'Service inserted successfully',
      data: { id: result.insertedId, ...serviceData }
    })
  } catch (error) {
    // Handle duplicate service name error
    if (error.message.includes('already exists')) {
      console.error('[API] Duplicate service error:', error)
      return res.status(409).json({ message: 'Service with the same name already exists' })
    }

    // Log any unexpected errors
    console.error('[API] Error handling request:', error.message)
    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}
