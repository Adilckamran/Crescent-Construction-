import { Router, Response } from 'express'
import { db } from '../db'
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth'

export const statsRouter = Router()

statsRouter.get('/', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const stats = await db.getStats()
    res.json(stats)
  } catch (err) {
    console.error('Error fetching admin statistics:', err)
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics.' })
  }
})
