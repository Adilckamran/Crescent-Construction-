import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../db'
import { authenticateToken, requireAdmin, generateToken, AuthenticatedRequest } from '../middleware/auth'

export const authRouter = Router()

// Public Registration
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' })
      return
    }

    const trimmedEmail = email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address.' })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' })
      return
    }

    const existing = await db.getUserByEmail(trimmedEmail)
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' })
      return
    }

    const salt = bcrypt.genSaltSync(10)
    const password_hash = bcrypt.hashSync(password, salt)

    const user = await db.createUser({
      name: name.trim(),
      email: trimmedEmail,
      password_hash,
      role: 'user',
      status: 'active',
    })

    const { password_hash: _, ...safeUser } = user
    const token = generateToken(safeUser)

    await db.recordLoginActivity({
      user_id: user.id,
      email: user.email,
      status: 'success',
      ip_address: req.ip || req.socket.remoteAddress || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown',
    })

    res.status(201).json({
      message: 'Account created successfully.',
      user: safeUser,
      token,
    })
  } catch (err: any) {
    console.error('Registration error:', err)
    res.status(500).json({ error: 'Server error during registration. Please try again.' })
  }
})

// Public Login
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' })
      return
    }

    const trimmedEmail = email.toLowerCase().trim()
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    const userAgent = req.headers['user-agent'] || 'unknown'

    const user = await db.getUserByEmail(trimmedEmail)
    if (!user) {
      await db.recordLoginActivity({
        email: trimmedEmail,
        status: 'failed',
        ip_address: ip,
        user_agent: userAgent,
      })
      res.status(401).json({ error: 'Invalid email or password.' })
      return
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash)
    if (!isMatch) {
      await db.recordLoginActivity({
        user_id: user.id,
        email: trimmedEmail,
        status: 'failed',
        ip_address: ip,
        user_agent: userAgent,
      })
      res.status(401).json({ error: 'Invalid email or password.' })
      return
    }

    if (user.status === 'inactive') {
      res.status(403).json({ error: 'This account has been deactivated. Please contact administration.' })
      return
    }

    // Update last login
    await db.updateUser(user.id, { last_login_at: new Date().toISOString() })

    // Record login activity
    await db.recordLoginActivity({
      user_id: user.id,
      email: trimmedEmail,
      status: 'success',
      ip_address: ip,
      user_agent: userAgent,
    })

    const { password_hash: _, ...safeUser } = user
    const token = generateToken(safeUser)

    res.json({
      message: 'Login successful.',
      user: safeUser,
      token,
    })
  } catch (err: any) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error during login. Please try again.' })
  }
})

// Current Session Info
authRouter.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  res.json({ user: req.user })
})

// Change Password
authRouter.post('/change-password', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required.' })
      return
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters.' })
      return
    }

    const user = await db.getUserById(req.user!.id)
    if (!user) {
      res.status(404).json({ error: 'User not found.' })
      return
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password_hash)
    if (!isMatch) {
      res.status(400).json({ error: 'Current password does not match.' })
      return
    }

    const salt = bcrypt.genSaltSync(10)
    const newHash = bcrypt.hashSync(newPassword, salt)
    await db.updateUser(user.id, { password_hash: newHash })

    res.json({ message: 'Password updated successfully.' })
  } catch (err: any) {
    console.error('Change password error:', err)
    res.status(500).json({ error: 'Failed to update password.' })
  }
})

// Admin: Get Login Activity
authRouter.get('/activity', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string || '100', 10)
    const activity = await db.getLoginActivity(limit)
    res.json({ activity })
  } catch (err) {
    console.error('Error fetching login activity:', err)
    res.status(500).json({ error: 'Failed to retrieve login activity.' })
  }
})
