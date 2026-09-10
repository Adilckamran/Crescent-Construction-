import { Router, Request, Response } from 'express'
import { db } from '../db'
import { authenticateToken, requireAdmin, AuthenticatedRequest, contactRateLimit } from '../middleware/auth'
import { sendInquiryNotification } from '../services/email'

export const inquiriesRouter = Router()

// Public: Submit contact inquiry
inquiriesRouter.post('/', contactRateLimit, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, project_type, location, budget, message, _gotcha } = req.body

    // Honeypot spam trap
    if (_gotcha) {
      console.warn('[SPAM BOT TRAP TRIGGERED] Ignoring bot submission:', { name, email })
      res.json({ message: 'Inquiry received successfully.' })
      return
    }

    if (!name || !phone || !email) {
      res.status(400).json({ error: 'Please provide your name, phone number, and email address.' })
      return
    }

    const trimmedEmail = email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400).json({ error: 'Please provide a valid email address.' })
      return
    }

    const trimmedPhone = phone.trim()
    if (trimmedPhone.length < 8) {
      res.status(400).json({ error: 'Please enter a valid phone number.' })
      return
    }

    // Persist in database
    const inquiry = await db.createInquiry({
      name: name.trim(),
      phone: trimmedPhone,
      email: trimmedEmail,
      project_type: project_type ? project_type.trim() : 'General Inquiry',
      location: location ? location.trim() : '',
      budget: budget ? budget.trim() : '',
      message: message ? message.trim() : 'No additional message provided.',
    })

    // Dispatch email notification non-blockingly
    sendInquiryNotification({
      name: inquiry.name,
      phone: inquiry.phone,
      email: inquiry.email,
      project_type: inquiry.project_type,
      location: inquiry.location,
      budget: inquiry.budget,
      message: inquiry.message,
      createdAt: inquiry.created_at,
    }).catch(err => {
      console.error('[EMAIL NOTIFICATION EXCEPTION]:', err)
    })

    res.status(201).json({
      success: true,
      message: 'Thank you! Your inquiry has been received. Our team will review your project details and contact you promptly.',
      inquiryId: inquiry.id,
    })
  } catch (err) {
    console.error('Inquiry submission error:', err)
    res.status(500).json({ error: 'There was an error saving your inquiry. Please contact us directly via WhatsApp or phone.' })
  }
})

// Admin: Get all inquiries
inquiriesRouter.get('/admin/list', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const unreadOnly = req.query.unread === 'true'
    const search = req.query.search as string | undefined

    const inquiries = await db.getInquiries({ unreadOnly, search })
    res.json({ inquiries })
  } catch (err) {
    console.error('Error getting inquiries:', err)
    res.status(500).json({ error: 'Failed to retrieve inquiries.' })
  }
})

// Admin: Toggle read/unread status
inquiriesRouter.patch('/admin/:id/read', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { is_read } = req.body

    const existing = await db.getInquiryById(id)
    if (!existing) {
      res.status(404).json({ error: 'Inquiry not found.' })
      return
    }

    const updated = await db.updateInquiry(id, { is_read: is_read !== undefined ? Boolean(is_read) : !existing.is_read })
    res.json({ message: 'Inquiry status updated.', inquiry: updated })
  } catch (err) {
    console.error('Error updating inquiry read status:', err)
    res.status(500).json({ error: 'Failed to update inquiry status.' })
  }
})

// Admin: Delete inquiry
inquiriesRouter.delete('/admin/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const deleted = await db.deleteInquiry(id)
    if (!deleted) {
      res.status(404).json({ error: 'Inquiry not found.' })
      return
    }
    res.json({ message: 'Inquiry deleted successfully.' })
  } catch (err) {
    console.error('Error deleting inquiry:', err)
    res.status(500).json({ error: 'Failed to delete inquiry.' })
  }
})
