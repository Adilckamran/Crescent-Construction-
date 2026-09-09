import { Router, Request, Response } from 'express'
import { db } from '../db'
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth'

export const projectsRouter = Router()

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 6)
}

// Public: Get all projects
projectsRouter.get('/', (req: Request, res: Response): void => {
  try {
    const category = req.query.category as string | undefined
    const featured = req.query.featured !== undefined ? req.query.featured === 'true' : undefined
    const search = req.query.search as string | undefined

    const projects = db.getProjects({ category, featured, search })
    res.json({ projects })
  } catch (err) {
    console.error('Error fetching projects:', err)
    res.status(500).json({ error: 'Failed to retrieve projects.' })
  }
})

// Public: Get single project by ID or Slug
projectsRouter.get('/:idOrSlug', (req: Request, res: Response): void => {
  try {
    const project = db.getProjectByIdOrSlug(req.params.idOrSlug)
    if (!project) {
      res.status(404).json({ error: 'Project not found.' })
      return
    }
    res.json({ project })
  } catch (err) {
    console.error('Error fetching project:', err)
    res.status(500).json({ error: 'Failed to retrieve project details.' })
  }
})

// Admin: Create new project
projectsRouter.post('/', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const {
      title,
      category,
      location,
      status,
      short_desc,
      full_desc,
      images,
      featured,
      completion_year,
    } = req.body

    if (!title || !category || !location || !short_desc) {
      res.status(400).json({ error: 'Title, category, location, and short description are required.' })
      return
    }

    const slug = generateSlug(title)
    const validImages = Array.isArray(images) && images.length > 0 ? images : ['/uploads/project-2.jpg']

    const project = db.createProject({
      title: title.trim(),
      slug,
      category,
      location: location.trim(),
      status: status || 'Completed',
      short_desc: short_desc.trim(),
      full_desc: full_desc ? full_desc.trim() : short_desc.trim(),
      images: validImages,
      featured: Boolean(featured),
      completion_year: completion_year || new Date().getFullYear().toString(),
    })

    res.status(201).json({ message: 'Project created successfully.', project })
  } catch (err) {
    console.error('Error creating project:', err)
    res.status(500).json({ error: 'Failed to create project.' })
  }
})

// Admin: Update project
projectsRouter.put('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params
    const project = db.getProjectByIdOrSlug(id)
    if (!project) {
      res.status(404).json({ error: 'Project not found.' })
      return
    }

    const {
      title,
      category,
      location,
      status,
      short_desc,
      full_desc,
      images,
      featured,
      completion_year,
    } = req.body

    const updated = db.updateProject(project.id, {
      ...(title && { title: title.trim() }),
      ...(category && { category }),
      ...(location && { location: location.trim() }),
      ...(status && { status }),
      ...(short_desc && { short_desc: short_desc.trim() }),
      ...(full_desc !== undefined && { full_desc: full_desc.trim() }),
      ...(Array.isArray(images) && { images }),
      ...(featured !== undefined && { featured: Boolean(featured) }),
      ...(completion_year && { completion_year }),
    })

    res.json({ message: 'Project updated successfully.', project: updated })
  } catch (err) {
    console.error('Error updating project:', err)
    res.status(500).json({ error: 'Failed to update project.' })
  }
})

// Admin: Delete project
projectsRouter.delete('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params
    const project = db.getProjectByIdOrSlug(id)
    if (!project) {
      res.status(404).json({ error: 'Project not found.' })
      return
    }

    const deleted = db.deleteProject(project.id)
    if (!deleted) {
      res.status(500).json({ error: 'Could not delete project.' })
      return
    }

    res.json({ message: 'Project deleted successfully.' })
  } catch (err) {
    console.error('Error deleting project:', err)
    res.status(500).json({ error: 'Failed to delete project.' })
  }
})
