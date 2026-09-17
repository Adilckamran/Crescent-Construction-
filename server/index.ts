import dotenv from 'dotenv'
dotenv.config()

import path from 'path'
import fs from 'fs'
import { app } from './app'

const PORT = process.env.PORT || 5000

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
