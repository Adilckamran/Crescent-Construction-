import { Router, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth'

export const uploadRouter = Router()

const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads')

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20)
    const unique = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    cb(null, `img-${cleanName || 'project'}-${unique}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 }, // 12MB limit per image
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/i
    const extname = allowed.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowed.test(file.mimetype)

    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP) are allowed.'))
    }
  },
})

// Upload multiple images
uploadRouter.post(
  '/',
  authenticateToken,
  requireAdmin,
  upload.array('images', 10),
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const files = req.files as Express.Multer.File[] | undefined
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No image files uploaded.' })
        return
      }

      const urls = files.map(file => `/uploads/${file.filename}`)
      res.json({
        message: `${files.length} image(s) uploaded successfully.`,
        urls,
      })
    } catch (err: any) {
      console.error('Image upload error:', err)
      res.status(500).json({ error: err?.message || 'Failed to upload images.' })
    }
  }
)

// Delete uploaded image
uploadRouter.post('/delete', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { url } = req.body
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'Image URL is required.' })
      return
    }

    const filename = path.basename(url)
    const filePath = path.join(UPLOADS_DIR, filename)

    // Only delete files starting with img- (protect original seed images)
    if (filename.startsWith('img-') && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      res.json({ message: 'Image deleted from disk.' })
      return
    }

    res.json({ message: 'Reference removed.' })
  } catch (err) {
    console.error('Error deleting image:', err)
    res.status(500).json({ error: 'Failed to delete image.' })
  }
})
