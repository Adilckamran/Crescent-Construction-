import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'

import { db } from './db'
import { authRouter } from './routes/auth'
import { projectsRouter } from './routes/projects'
import { inquiriesRouter } from './routes/inquiries'
import { uploadRouter } from './routes/upload'
import { servicesRouter } from './routes/services'
import { testimonialsRouter } from './routes/testimonials'
import { usersRouter } from './routes/users'
import { statsRouter } from './routes/stats'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

// Static file serving for uploads
const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
app.use('/uploads', express.static(uploadsDir))

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Crescent Construction API',
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

// In production, serve the built Vite SPA from dist/
const distDir = path.resolve(process.cwd(), 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next()
    }
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

// Global 404 handler for API
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' })
})

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[UNHANDLED SERVER ERROR]', err)
  res.status(500).json({ error: err?.message || 'Internal server error.' })
})

// Start server
app.listen(PORT, () => {
  console.log(`==================================================`)
  console.log(` Crescent Construction Backend Server Running`)
  console.log(` Port: ${PORT}`)
  console.log(` Health Check: http://localhost:${PORT}/api/health`)
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`==================================================`)
})
