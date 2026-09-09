import { Router, Request, Response } from 'express'
import { db } from '../db'
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth'

export const testimonialsRouter = Router()

// Public: Get testimonials
testimonialsRouter.get('/', (_req: Request, res: Response): void => {
  try {
    const testimonials = db.getTestimonials()
    res.json({ testimonials })
  } catch (err) {
    console.error('Error fetching testimonials:', err)
    res.status(500).json({ error: 'Failed to retrieve testimonials.' })
  }
})

// Admin: Add testimonial
testimonialsRouter.post('/', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { label, type, location, quote, is_sample, rating } = req.body
    if (!quote || !label) {
      res.status(400).json({ error: 'Label and quote are required.' })
      return
    }

    const testimonial = db.createTestimonial({
      label: label.trim(),
      type: type ? type.trim() : 'Construction Client',
      location: location ? location.trim() : 'Karachi',
      quote: quote.trim(),
      is_sample: Boolean(is_sample),
      rating: typeof rating === 'number' ? rating : 5,
    })

    res.status(201).json({ message: 'Testimonial created successfully.', testimonial })
  } catch (err) {
    console.error('Error creating testimonial:', err)
    res.status(500).json({ error: 'Failed to create testimonial.' })
  }
})

// Admin: Update testimonial
testimonialsRouter.put('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params
    const updated = db.updateTestimonial(id, req.body)
    if (!updated) {
      res.status(404).json({ error: 'Testimonial not found.' })
      return
    }
    res.json({ message: 'Testimonial updated successfully.', testimonial: updated })
  } catch (err) {
    console.error('Error updating testimonial:', err)
    res.status(500).json({ error: 'Failed to update testimonial.' })
  }
})

// Admin: Delete testimonial
testimonialsRouter.delete('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params
    const deleted = db.deleteTestimonial(id)
    if (!deleted) {
      res.status(404).json({ error: 'Testimonial not found.' })
      return
    }
    res.json({ message: 'Testimonial deleted successfully.' })
  } catch (err) {
    console.error('Error deleting testimonial:', err)
    res.status(500).json({ error: 'Failed to delete testimonial.' })
  }
})
