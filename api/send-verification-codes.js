export default async function handler(req, res) {
  // Handle preflight OPTIONS request (for CORS)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    return res.status(200).end()
  }

  // Handle POST request
  if (req.method === 'POST') {
    const { email, phoneNumber } = req.body

    if (!email || !phoneNumber) {
      return res.status(400).json({ error: 'Email and phone number are required.' })
    }

    try {
      // Generate mock verification codes
      const emailVerificationCode = Math.floor(Math.random() * 1000000)
      const phoneVerificationCode = Math.floor(Math.random() * 1000000)

      // Log the input to verify it's correct
      console.log(`Mock email verification code sent to: ${email} - Code: ${emailVerificationCode}`)
      console.log(`Mock phone verification code sent to: ${phoneNumber} - Code: ${phoneVerificationCode}`)

      // Send the verification codes back as a response
      res.status(200).json({
        message: 'Verification codes sent successfully.',
        emailVerificationCode,
        phoneVerificationCode
      })
    } catch (error) {
      console.error('Error sending verification codes:', error)
      res.status(500).json({ error: 'Failed to send verification codes.' })
    }
  } else {
    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' })
  }
}
