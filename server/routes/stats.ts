import { Router, Response } from 'express'
import { db } from '../db'
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth'

export const statsRouter = Router()

statsRouter.get('/', authenticateToken, requireAdmin, (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const stats = db.getStats()
    res.json(stats)
  } catch (err) {
    console.error('Error fetching admin statistics:', err)
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics.' })
  }
})
