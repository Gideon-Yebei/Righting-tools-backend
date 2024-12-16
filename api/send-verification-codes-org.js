import nodemailer from 'nodemailer'
import twilio from 'twilio'

// Twilio credentials (Replace these with your actual Twilio Account SID and Auth Token)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

// Email credentials
const EMAIL_HOST = process.env.EMAIL_HOST
const EMAIL_PORT = process.env.EMAIL_PORT
const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, phoneNumber } = req.body

  if (!email || !phoneNumber) {
    return res.status(400).json({ error: 'Email and phone number are required.' })
  }

  try {
    // Generate random 6-digit verification codes
    const emailCode = Math.floor(100000 + Math.random() * 900000).toString()
    const phoneCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Send email verification code
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    })

    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Your Email Verification Code',
      text: `Your verification code is: ${emailCode}`
    })

    // Send phone verification code via Twilio
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    await client.messages.create({
      body: `Your phone verification code is: ${phoneCode}`,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber
    })

    // Respond with the generated codes
    res.status(200).json({
      emailCode,
      phoneCode,
      message: 'Verification codes sent successfully.'
    })
  } catch (error) {
    console.error('Error sending verification codes:', error)
    res.status(500).json({ error: 'Failed to send verification codes.' })
  }
}
