import { Router, Request, Response } from 'express'
import { db } from '../db'
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth'

export const servicesRouter = Router()

// Public: Get all services
servicesRouter.get('/', (_req: Request, res: Response): void => {
  try {
    const services = db.getServices()
    res.json({ services })
  } catch (err) {
    console.error('Error fetching services:', err)
    res.status(500).json({ error: 'Failed to retrieve services.' })
  }
})

// Admin: Add service
servicesRouter.post('/', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { number, title, desc, icon_name, cta, sort_order } = req.body
    if (!title || !desc) {
      res.status(400).json({ error: 'Service title and description are required.' })
      return
    }

    const service = db.createService({
      number: number || '00',
      title: title.trim(),
      desc: desc.trim(),
      icon_name: icon_name || 'Building2',
      cta,
      sort_order: typeof sort_order === 'number' ? sort_order : 99,
    })

    res.status(201).json({ message: 'Service added successfully.', service })
  } catch (err) {
    console.error('Error adding service:', err)
    res.status(500).json({ error: 'Failed to add service.' })
  }
})

// Admin: Update service
servicesRouter.put('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params
    const updated = db.updateService(id, req.body)
    if (!updated) {
      res.status(404).json({ error: 'Service not found.' })
      return
    }
    res.json({ message: 'Service updated successfully.', service: updated })
  } catch (err) {
    console.error('Error updating service:', err)
    res.status(500).json({ error: 'Failed to update service.' })
  }
})

// Admin: Delete service
servicesRouter.delete('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params
    const deleted = db.deleteService(id)
    if (!deleted) {
      res.status(404).json({ error: 'Service not found.' })
      return
    }
    res.json({ message: 'Service deleted successfully.' })
  } catch (err) {
    console.error('Error deleting service:', err)
    res.status(500).json({ error: 'Failed to delete service.' })
  }
})
