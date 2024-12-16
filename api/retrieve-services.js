import { getAllServices } from './db.js'

/**
 * Main function to handle retrieval of premium tools.
 * @param {import('@vercel/node').VercelRequest} req - The incoming HTTP request.
 * @param {import('@vercel/node').VercelResponse} res - The outgoing HTTP response.
 */
export default async function handler(req, res) {
  console.log('[API] Received request:', {
    method: req.method,
    url: req.url,
    headers: req.headers
  })

  // Ensure the request is a GET request
  if (req.method !== 'GET') {
    console.log('[API] Invalid request method:', req.method)
    return res.status(405).json({ message: 'Only GET requests are allowed' })
  }

  try {
    console.log('[API] Retrieving all services from the database...')

    // Retrieve all services
    const services = await getAllServices()

    // Check if any services were retrieved
    if (services.length === 0) {
      console.log('[API] No services found')
      return res.status(404).json({ message: 'No services found' })
    }

    console.log('[API] Retrieved services:', services)

    // Send success response with retrieved services
    return res.status(200).json({
      message: 'Services retrieved successfully',
      data: services
    })

  } catch (error) {
    // Log the error for debugging
    console.error('[API] Error handling GET request:', error.message)

    // Return generic error message to the client
    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}
