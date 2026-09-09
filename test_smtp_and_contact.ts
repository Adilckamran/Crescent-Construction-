import dotenv from 'dotenv'
dotenv.config()
import nodemailer from 'nodemailer'
import { db } from './server/db'
import { sendInquiryNotification } from './server/services/email'

async function runTest() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER || 'crescentconstructionofficial@gmail.com'
  const pass = process.env.SMTP_PASS || ''
  const receiver = process.env.CONTACT_RECEIVER_EMAIL || 'crescentconstructionofficial@gmail.com'

  console.log('=== 1. GMAIL SMTP CONNECTION & AUTHENTICATION TEST ===')
  console.log('Host:', host)
  console.log('Port:', port)
  console.log('User:', user)
  console.log('Password set in .env:', pass ? `YES (${pass.length} characters)` : 'NO (empty)')

  if (!pass) {
    console.error('RESULT: SMTP_PASS is missing or empty in .env!')
    return
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: {
      user,
      pass,
    },
  })

  let verified = false
  try {
    await transporter.verify()
    console.log('SMTP Connection: SUCCESS')
    console.log('Authentication: SUCCESS')
    verified = true
  } catch (err: any) {
    console.log('SMTP Connection: FAILED')
    console.log('Authentication: FAILED')
    const safeMsg = (err?.message || String(err)).replace(
      new RegExp(pass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      '***REDACTED***'
    )
    console.log('Error message:', safeMsg)
    return
  }

  if (verified) {
    console.log('\n=== 2. SENDING TEST EMAIL ===')
    console.log(`Target Recipient: ${receiver}`)
    try {
      const info = await transporter.sendMail({
        from: `"Crescent Construction System" <${user}>`,
        to: receiver,
        subject: 'Crescent Construction - Live SMTP Verification',
        text: 'This is an automated verification email confirming that Gmail SMTP delivery is active and working properly for Crescent Construction.',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; background: #F7F6F2; color: #20252B;">
            <div style="max-width: 540px; margin: 0 auto; background: #ffffff; padding: 28px; border-top: 4px solid #D9A21B; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
              <h2 style="color: #0B1F3A; margin-top: 0; font-size: 20px;">Crescent Construction SMTP Verification</h2>
              <p style="font-size: 14px; line-height: 1.6;">This email confirms that the Gmail App Password connection and live email dispatch are operating properly.</p>
              <div style="background: #F9FAFB; border-left: 3px solid #D9A21B; padding: 12px 16px; margin: 16px 0; font-size: 13px;">
                <strong>Status:</strong> Active &amp; Verified<br />
                <strong>Recipient:</strong> ${receiver}<br />
                <strong>Timestamp:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })} (PKT)
              </div>
              <p style="font-size: 12px; color: #6B7280; margin-bottom: 0;">Office No. M-07, Panama Centre, Block 13 D3, Gulshan-e-Iqbal, Karachi</p>
            </div>
          </div>
        `,
      })
      console.log('Test Email: SUCCESS')
      console.log('Message ID:', info.messageId)
      console.log('SMTP Response:', info.response)
    } catch (err: any) {
      console.log('Test Email: FAILED')
      const safeMsg = (err?.message || String(err)).replace(
        new RegExp(pass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        '***REDACTED***'
      )
      console.log('Error message:', safeMsg)
    }
  }

  console.log('\n=== 3. CONTACT FORM PIPELINE END-TO-END TEST ===')
  console.log('Testing: Contact Form Payload -> Backend API Logic -> Database Persistence -> Live Email Notification')

  const testInquiryData = {
    name: 'Muhammad Farooq (Live Test Inquiry)',
    phone: '03272834501',
    email: 'crescentconstructionofficial@gmail.com',
    project_type: 'Complete House Construction',
    location: 'Gulshan-e-Iqbal Block 13 D3, Karachi',
    budget: 'PKR 60 lac',
    message: 'Testing live Contact Form submission pipeline: Contact Form -> Backend -> Database -> Email.',
  }

  // Step A: Database persistence
  const inquiry = db.createInquiry(testInquiryData)
  console.log('[Step 1] Database Storage: SUCCESS (Inquiry ID: ' + inquiry.id + ')')

  // Step B: Verify in database
  const inDb = db.getInquiryById(inquiry.id)
  if (inDb && inDb.name === testInquiryData.name) {
    console.log('[Step 2] Database Retrieval Verification: SUCCESS (Record confirmed in crescent_db.json)')
  } else {
    console.log('[Step 2] Database Retrieval Verification: FAILED')
  }

  // Step C: Send full branded inquiry notification email
  console.log('[Step 3] Dispatching branded customer inquiry email...')
  const emailNotification = await sendInquiryNotification({
    name: inquiry.name,
    phone: inquiry.phone,
    email: inquiry.email,
    project_type: inquiry.project_type,
    location: inquiry.location,
    budget: inquiry.budget,
    message: inquiry.message,
    createdAt: inquiry.created_at,
  })

  if (emailNotification.success) {
    console.log('[Step 4] Inquiry Email Delivery: SUCCESS')
    console.log('Inquiry Email Message ID:', emailNotification.messageId)
  } else {
    console.log('[Step 4] Inquiry Email Delivery: FAILED')
    const safeMsg = (emailNotification.error || 'Unknown').replace(
      new RegExp(pass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      '***REDACTED***'
    )
    console.log('Error message:', safeMsg)
  }

  console.log('\n=== ALL TESTS FINISHED ===')
}

runTest().catch((err) => {
  console.error('Execution error:', err?.message || err)
})
