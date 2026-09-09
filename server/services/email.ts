import nodemailer from 'nodemailer'

interface InquiryEmailData {
  name: string
  phone: string
  email: string
  project_type?: string
  location?: string
  budget?: string
  message: string
  createdAt: string
}

export async function sendInquiryNotification(data: InquiryEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || 'crescentconstructionofficial@gmail.com'
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10)
  const smtpUser = process.env.SMTP_USER || 'crescentconstructionofficial@gmail.com'
  const smtpPass = process.env.SMTP_PASS || ''

  // If no SMTP password is configured, log warning and return
  if (!smtpPass) {
    console.warn('[EMAIL SERVICE] SMTP_PASS not set in .env. Inquiry was stored in database, but live email was not dispatched. To enable live email dispatch, configure SMTP_PASS in .env.')
    return { success: false, error: 'SMTP_PASS not configured in .env' }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F7F6F2; margin: 0; padding: 24px; color: #20252B; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-top: 4px solid #D9A21B; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #0B1F3A; padding: 28px; text-align: center; }
    .header h1 { color: #F7F6F2; font-size: 22px; margin: 0; font-weight: 600; letter-spacing: 0.5px; }
    .header p { color: #D9A21B; font-size: 11px; margin-top: 6px; text-transform: uppercase; letter-spacing: 2px; }
    .content { padding: 32px 28px; }
    .title-row { border-bottom: 1px solid #E5E7EB; padding-bottom: 16px; margin-bottom: 24px; }
    .title-row h2 { margin: 0; font-size: 18px; color: #0B1F3A; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .info-table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #F3F4F6; }
    .info-table td.label { width: 140px; font-weight: 600; color: #6B7280; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    .info-table td.value { color: #111827; font-weight: 500; }
    .message-box { background: #F9FAFB; border: 1px solid #E5E7EB; border-left: 3px solid #D9A21B; padding: 16px; margin-top: 8px; border-radius: 2px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
    .footer { background: #F7F6F2; padding: 20px; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; }
    .btn-row { margin-top: 24px; text-align: center; }
    .btn { display: inline-block; background: #D9A21B; color: #071525; padding: 10px 20px; text-decoration: none; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Crescent Construction</h1>
      <p>Building Today, Creating Tomorrow</p>
    </div>
    <div class="content">
      <div class="title-row">
        <h2>New Project Inquiry Received</h2>
        <p style="font-size: 12px; color: #6B7280; margin: 4px 0 0;">Received on ${new Date(data.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Karachi' })} (PKT)</p>
      </div>

      <table class="info-table">
        <tr>
          <td class="label">Full Name</td>
          <td class="value">${data.name}</td>
        </tr>
        <tr>
          <td class="label">Phone</td>
          <td class="value"><a href="tel:${data.phone}" style="color: #0B1F3A; text-decoration: none; font-weight: 600;">${data.phone}</a></td>
        </tr>
        <tr>
          <td class="label">Email</td>
          <td class="value"><a href="mailto:${data.email}" style="color: #0B1F3A; text-decoration: none;">${data.email}</a></td>
        </tr>
        <tr>
          <td class="label">Project Type</td>
          <td class="value">${data.project_type || 'Not specified'}</td>
        </tr>
        <tr>
          <td class="label">Location</td>
          <td class="value">${data.location || 'Not specified'}</td>
        </tr>
        <tr>
          <td class="label">Estimated Budget</td>
          <td class="value">${data.budget || 'Not specified'}</td>
        </tr>
      </table>

      <div>
        <p style="font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; margin-bottom: 6px;">Client Message:</p>
        <div class="message-box">${data.message || 'No additional message provided.'}</div>
      </div>

      <div class="btn-row">
        <a href="https://wa.me/${data.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(data.name)},%20thank%20you%20for%20contacting%20Crescent%20Construction." class="btn">Reply via WhatsApp</a>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0;">This email was automatically generated by the Crescent Construction website contact system.</p>
      <p style="margin: 4px 0 0;">Office No. M-07, Panama Centre, Block 13 D3, Gulshan-e-Iqbal, Karachi | Phone: 0327 2834501</p>
    </div>
  </div>
</body>
</html>
`

    const info = await transporter.sendMail({
      from: `"Crescent Website Inquiry" <${smtpUser}>`,
      to: receiverEmail,
      replyTo: data.email,
      subject: `New Inquiry: ${data.name} - ${data.project_type || 'Construction Project'}`,
      text: `New Inquiry from ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nProject Type: ${data.project_type || 'N/A'}\nLocation: ${data.location || 'N/A'}\nBudget: ${data.budget || 'N/A'}\n\nMessage:\n${data.message}`,
      html: htmlContent,
    })

    console.log('[EMAIL SERVICE] Notification successfully sent to:', receiverEmail, 'Message ID:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (err: any) {
    console.error('[EMAIL SERVICE] Error dispatching email notification:', err?.message || err)
    return { success: false, error: err?.message || 'Email delivery failed' }
  }
}
