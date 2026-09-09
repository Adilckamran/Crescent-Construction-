import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { db, User } from '../db'

export interface AuthenticatedRequest extends Request {
  user?: Omit<User, 'password_hash'>
}

const JWT_SECRET = process.env.JWT_SECRET || 'crescent-construction-jwt-secret-2026-production'

export function generateToken(user: Omit<User, 'password_hash'>): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' })
    return
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: 'admin' | 'user' }
    const user = db.getUserById(payload.id)

    if (!user) {
      res.status(401).json({ error: 'User account no longer exists.' })
      return
    }

    if (user.status === 'inactive') {
      res.status(403).json({ error: 'Account has been deactivated. Please contact administration.' })
      return
    }

    const { password_hash, ...safeUser } = user
    req.user = safeUser
    next()
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired authentication token.' })
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' })
    return
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' })
    return
  }

  next()
}

// Simple IP-based rate limiter for contact submissions
const submissionTracker = new Map<string, { count: number; firstAt: number }>()

export function contactRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip'
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxSubmissions = 10 // max 10 per 15 mins

  const record = submissionTracker.get(ip)
  if (!record) {
    submissionTracker.set(ip, { count: 1, firstAt: now })
    next()
    return
  }

  if (now - record.firstAt > windowMs) {
    submissionTracker.set(ip, { count: 1, firstAt: now })
    next()
    return
  }

  if (record.count >= maxSubmissions) {
    res.status(429).json({
      error: 'Too many inquiries submitted from this connection. Please wait a few minutes or contact us directly via WhatsApp.'
    })
    return
  }

  record.count++
  next()
}
