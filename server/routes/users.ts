import { Router, Response } from 'express'
import { db } from '../db'
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth'

export const usersRouter = Router()

// Admin: Get all registered users
usersRouter.get('/', authenticateToken, requireAdmin, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await db.getUsers()
    res.json({ users })
  } catch (err) {
    console.error('Error fetching users:', err)
    res.status(500).json({ error: 'Failed to retrieve users.' })
  }
})

// Admin: Update user status or role
usersRouter.patch('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { status, role } = req.body

    const targetUser = await db.getUserById(id)
    if (!targetUser) {
      res.status(404).json({ error: 'User not found.' })
      return
    }

    // Prevent deactivating own account
    if (id === req.user!.id && status === 'inactive') {
      res.status(400).json({ error: 'You cannot deactivate your own administrative account.' })
      return
    }

    // Prevent removing admin rights from self
    if (id === req.user!.id && role === 'user') {
      res.status(400).json({ error: 'You cannot revoke administrator privileges from your own account.' })
      return
    }

    const updates: any = {}
    if (status && (status === 'active' || status === 'inactive')) {
      updates.status = status
    }
    if (role && (role === 'admin' || role === 'user')) {
      updates.role = role
    }

    const updated = await db.updateUser(id, updates)
    if (!updated) {
      res.status(500).json({ error: 'Failed to update user.' })
      return
    }

    const { password_hash, ...safeUser } = updated
    res.json({ message: 'User updated successfully.', user: safeUser })
  } catch (err) {
    console.error('Error updating user:', err)
    res.status(500).json({ error: 'Failed to update user.' })
  }
})

// Admin: Delete user
usersRouter.delete('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    if (id === req.user!.id) {
      res.status(400).json({ error: 'You cannot delete your own account.' })
      return
    }

    const deleted = await db.deleteUser(id)
    if (!deleted) {
      res.status(404).json({ error: 'User not found.' })
      return
    }

    res.json({ message: 'User deleted successfully.' })
  } catch (err) {
    console.error('Error deleting user:', err)
    res.status(500).json({ error: 'Failed to delete user.' })
  }
})
