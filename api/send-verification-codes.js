export default async function handler(req, res) {
  // Handle preflight OPTIONS request (for CORS)
  if (req.method === 'OPTIONS') {
    console.log('[API] Handling OPTIONS request for CORS')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    return res.status(200).end()
  }

  // Handle POST request for generating verification codes
  if (req.method === 'POST') {
    const { email, phoneNumber } = req.body

    console.log('[API] Received POST request:', { email, phoneNumber })

    // Validate required fields
    if (!email || !phoneNumber) {
      console.error('[API] Missing required fields:', { email, phoneNumber })
      return res.status(400).json({ error: 'Email and phone number are required.' })
    }

    try {
      // Generate mock verification codes (6-digit random number)
      const emailVerificationCode = Math.floor(Math.random() * 1000000)
      const phoneVerificationCode = Math.floor(Math.random() * 1000000)

      // Log the verification codes (in a real application, don't log sensitive data)
      console.log(`[API] Mock email verification code sent to: ${email} - Code: ${emailVerificationCode}`)
      console.log(`[API] Mock phone verification code sent to: ${phoneNumber} - Code: ${phoneVerificationCode}`)

      // Return the verification codes in the response
      return res.status(200).json({
        message: 'Verification codes sent successfully.',
        emailVerificationCode,
        phoneVerificationCode
      })
    } catch (error) {
      // Log any errors that occur during the process
      console.error('[API] Error sending verification codes:', error)
      return res.status(500).json({ error: 'Failed to send verification codes.' })
    }
  }

  // Method not allowed
  console.log('[API] Method not allowed:', req.method)
  return res.status(405).json({ error: 'Method not allowed' })
}
