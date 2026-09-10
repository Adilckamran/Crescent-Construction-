import { Router, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth'
import { supabase, isSupabaseConfigured, STORAGE_BUCKET } from '../supabase'

export const uploadRouter = Router()

const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

// Use memory storage so buffers can be dispatched to Supabase or local disk
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max per image
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

// Upload multiple images directly to Supabase Storage (with local fallback)
uploadRouter.post(
  '/',
  authenticateToken,
  requireAdmin,
  upload.array('images', 12),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[] | undefined
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No image files uploaded.' })
        return
      }

      const urls: string[] = []

      for (const file of files) {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
        const cleanName = path
          .basename(file.originalname, ext)
          .replace(/[^a-zA-Z0-9_-]/g, '')
          .slice(0, 25)
        const unique = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
        const filename = `img-${cleanName || 'project'}-${unique}${ext}`

        // 1. Supabase Storage Upload
        if (isSupabaseConfigured() && supabase) {
          const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filename, file.buffer, {
              contentType: file.mimetype,
              cacheControl: '31536000',
              upsert: false,
            })

          if (uploadError) {
            console.error('[SUPABASE STORAGE ERROR]', uploadError)
            throw new Error(`Supabase Storage upload failed: ${uploadError.message}`)
          }

          const { data: publicUrlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(filename)

          urls.push(publicUrlData.publicUrl)
        } else {
          // 2. Local Fallback Disk Storage
          const localPath = path.join(UPLOADS_DIR, filename)
          fs.writeFileSync(localPath, file.buffer)
          urls.push(`/uploads/${filename}`)
        }
      }

      const storageType = isSupabaseConfigured() ? 'Supabase Cloud Storage' : 'Local Storage'
      console.log(`[STORAGE] Uploaded ${urls.length} image(s) to ${storageType}`)

      res.json({
        message: `${urls.length} image(s) uploaded successfully.`,
        urls,
        storage: storageType,
      })
    } catch (err: any) {
      console.error('Image upload error:', err)
      res.status(500).json({ error: err?.message || 'Failed to upload images.' })
    }
  }
)

// Delete uploaded image
uploadRouter.post('/delete', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { url } = req.body
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'Image URL is required.' })
      return
    }

    // Handle Supabase Storage deletion
    if (isSupabaseConfigured() && supabase && url.includes(STORAGE_BUCKET)) {
      const filename = url.split('/').pop()?.split('?')[0]
      if (filename) {
        await supabase.storage.from(STORAGE_BUCKET).remove([filename])
        res.json({ message: 'Image deleted from Supabase Storage.' })
        return
      }
    }

    // Handle Local Disk deletion
    const filename = path.basename(url)
    const filePath = path.join(UPLOADS_DIR, filename)
    if (filename.startsWith('img-') && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      res.json({ message: 'Image deleted from local disk.' })
      return
    }

    res.json({ message: 'Image reference handled.' })
  } catch (err) {
    console.error('Error deleting image:', err)
    res.status(500).json({ error: 'Failed to delete image.' })
  }
})
