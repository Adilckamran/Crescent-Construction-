import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'

import { authRouter } from './routes/auth'
import { projectsRouter } from './routes/projects'
import { inquiriesRouter } from './routes/inquiries'
import { uploadRouter } from './routes/upload'
import { servicesRouter } from './routes/services'
import { testimonialsRouter } from './routes/testimonials'
import { usersRouter } from './routes/users'
import { statsRouter } from './routes/stats'

const app = express()

// Netlify Serverless Path Normalization:
// Netlify redirects /api/* to /.netlify/functions/api/*
// This middleware rewrites the incoming path back to /api/* so Express route definitions match seamlessly.
app.use((req, _res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace(/^\/\.netlify\/functions\/api/, '/api')
  }
  next()
})

// Middleware
app.use(cors())
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

// Static file serving for uploads (safe in serverless read-only environments)
const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads')
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
} catch {
  // Read-only filesystem in serverless container
}
app.use('/uploads', express.static(uploadsDir))

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Crescent Construction API',
    environment: process.env.NODE_ENV || 'development',
    serverless: Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME),
    time: new Date().toISOString(),
  })
})

app.use('/api/auth', authRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/contact', inquiriesRouter)
app.use('/api/admin/inquiries', inquiriesRouter)
app.use('/api/admin/users', usersRouter)
app.use('/api/admin/stats', statsRouter)
app.use('/api/services', servicesRouter)
app.use('/api/testimonials', testimonialsRouter)
app.use('/api/upload', uploadRouter)

// Global 404 handler for API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' })
})

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[UNHANDLED SERVER ERROR]', err)
  res.status(500).json({ error: err?.message || 'Internal server error.' })
})

export { app }
