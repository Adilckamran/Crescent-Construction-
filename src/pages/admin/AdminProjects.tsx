import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Upload, 
  X, 
  Check, 
  AlertCircle, 
  Image as ImageIcon,
  MapPin, 
  Star,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { api, Project } from '../../services/api'

const CATEGORIES = ['Residential', 'Commercial', 'Grey Structure', 'Waterproofing', 'Renovation'] as const
const STATUSES = ['Completed', 'In Progress', 'Upcoming'] as const

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Form fields
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Project['category']>('Residential')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState<Project['status']>('Completed')
  const [completionYear, setCompletionYear] = useState(new Date().getFullYear().toString())
  const [featured, setFeatured] = useState(false)
  const [shortDesc, setShortDesc] = useState('')
  const [fullDesc, setFullDesc] = useState('')
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const res = await api.getProjects()
      setProjects(res.projects)
    } catch (err) {
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingProject(null)
    setTitle('')
    setCategory('Residential')
    setLocation('')
    setStatus('Completed')
    setCompletionYear(new Date().getFullYear().toString())
    setFeatured(false)
    setShortDesc('')
    setFullDesc('')
    setImages([])
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (p: Project) => {
    setEditingProject(p)
    setTitle(p.title)
    setCategory(p.category)
    setLocation(p.location)
    setStatus(p.status)
    setCompletionYear(p.completion_year || '')
    setFeatured(p.featured)
    setShortDesc(p.short_desc)
    setFullDesc(p.full_desc)
    setImages(p.images || [])
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    try {
      setUploading(true)
      const res = await api.uploadImages(files)
      setImages((prev) => [...prev, ...res.urls])
    } catch (err: any) {
      setFormError(err?.message || 'Failed to upload images.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = async (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url))
    try {
      await api.deleteUpload(url)
    } catch {
      // Non-critical
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!title.trim() || !location.trim() || !shortDesc.trim()) {
      setFormError('Please fill in Title, Location, and Short Description.')
      return
    }

    if (images.length === 0) {
      setFormError('Please upload or include at least one project photo.')
      return
    }

    try {
      setSaving(true)
      const payload = {
        title: title.trim(),
        category,
        location: location.trim(),
        status,
        completion_year: completionYear.trim(),
        featured,
        short_desc: shortDesc.trim(),
        full_desc: fullDesc.trim() || shortDesc.trim(),
        images,
      }

      if (editingProject) {
        await api.updateProject(editingProject.id, payload)
      } else {
        await api.createProject(payload)
      }

      setIsModalOpen(false)
      loadProjects()
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save project.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProject(id)
      setDeleteConfirmId(null)
      loadProjects()
    } catch (err: any) {
      alert(err?.message || 'Failed to delete project.')
    }
  }

  const filtered = projects.filter((p) => {
    const matchCat = filterCat === 'All' || p.category === filterCat
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-off/10">
        <div>
          <span className="eyebrow text-gold text-xs">Portfolio Administration</span>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-off mt-1">
            Projects Management
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-gold text-navy-dark font-semibold px-4 py-2.5 text-xs eyebrow hover:bg-gold-light transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-navy border border-off/10 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-off/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-navy-dark border border-off/15 pl-10 pr-4 py-2 text-xs text-off placeholder:text-off/30 focus:outline-none focus:border-gold"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="eyebrow text-off/40 text-[10px]">Filter:</span>
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1 text-xs eyebrow border transition-colors shrink-0 ${
                filterCat === cat
                  ? 'bg-gold text-navy-dark border-gold font-bold'
                  : 'border-off/15 text-off/60 hover:text-gold'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table & Cards */}
      {loading ? (
        <div className="text-center py-20 text-off/50">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="eyebrow text-gold text-xs">Loading Projects Database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-navy border border-dashed border-off/15 p-8">
          <p className="text-off/50 text-sm">No projects found.</p>
          <button
            onClick={openAddModal}
            className="mt-4 border border-gold text-gold text-xs eyebrow px-4 py-2 hover:bg-gold hover:text-navy-dark transition-colors"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="bg-navy border border-off/10 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-dark/70 border-b border-off/10 text-off/50 eyebrow text-[10px]">
              <tr>
                <th className="p-4">Project</th>
                <th className="p-4">Category</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-off/5">
              {filtered.map((p) => {
                const cover = p.images?.[0] || '/uploads/project-2.jpg'
                return (
                  <tr key={p.id} className="hover:bg-navy-dark/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-navy-dark shrink-0 overflow-hidden border border-off/10">
                          <img src={cover} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="font-semibold text-off text-sm block leading-snug">{p.title}</span>
                          <span className="text-off/40 text-[11px] block mt-0.5">
                            {p.images?.length || 0} photo(s) • {p.completion_year || 'Current'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="eyebrow bg-navy-dark px-2.5 py-1 text-[10px] text-gold border border-off/10">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 text-off/70 truncate max-w-[150px]">
                      {p.location}
                    </td>
                    <td className="p-4">
                      <span className="text-off/80 font-medium">{p.status}</span>
                    </td>
                    <td className="p-4 text-center">
                      {p.featured ? (
                        <span className="inline-flex items-center text-gold text-xs" title="Featured on Home">
                          <Star className="w-4 h-4 fill-gold text-gold" />
                        </span>
                      ) : (
                        <span className="text-off/20">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/projects/${p.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-off/40 hover:text-gold"
                          title="View Live Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-off/60 hover:text-gold"
                          title="Edit Project"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 text-off/40 hover:text-red-400"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-navy border border-off/20 max-w-2xl w-full p-6 sm:p-8 corner-ticks my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-off/10">
              <div>
                <span className="eyebrow text-gold text-xs">
                  {editingProject ? 'Modify Project' : 'New Project'}
                </span>
                <h3 className="font-display text-xl text-off font-semibold mt-1">
                  {editingProject ? editingProject.title : 'Add Construction Project'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-off/60 hover:text-off">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 bg-red-950/60 border border-red-500/40 p-3 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="eyebrow text-off/60 text-[11px] block mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern Villa Grey Structure"
                  className="w-full bg-navy-dark border border-off/20 p-2.5 text-off placeholder:text-off/30 focus:border-gold outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="eyebrow text-off/60 text-[11px] block mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-navy-dark border border-off/20 p-2.5 text-off focus:border-gold outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="eyebrow text-off/60 text-[11px] block mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-navy-dark border border-off/20 p-2.5 text-off focus:border-gold outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="eyebrow text-off/60 text-[11px] block mb-1.5">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. DHA Phase 8, Karachi"
                    className="w-full bg-navy-dark border border-off/20 p-2.5 text-off placeholder:text-off/30 focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="eyebrow text-off/60 text-[11px] block mb-1.5">
                    Completion Year
                  </label>
                  <input
                    type="text"
                    value={completionYear}
                    onChange={(e) => setCompletionYear(e.target.value)}
                    placeholder="e.g. 2024"
                    className="w-full bg-navy-dark border border-off/20 p-2.5 text-off placeholder:text-off/30 focus:border-gold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="eyebrow text-off/60 text-[11px] block mb-1.5">
                  Short Description (Catalog cards) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Summary of construction scope and key structural aspects..."
                  className="w-full bg-navy-dark border border-off/20 p-2.5 text-off placeholder:text-off/30 focus:border-gold outline-none resize-none"
                />
              </div>

              <div>
                <label className="eyebrow text-off/60 text-[11px] block mb-1.5">
                  Full Project Description (Details page)
                </label>
                <textarea
                  rows={4}
                  value={fullDesc}
                  onChange={(e) => setFullDesc(e.target.value)}
                  placeholder="In-depth details on foundation, concrete curing, structural steel, finishes, materials used, etc."
                  className="w-full bg-navy-dark border border-off/20 p-2.5 text-off placeholder:text-off/30 focus:border-gold outline-none resize-none"
                />
              </div>

              {/* DIRECT IMAGE UPLOAD SECTION */}
              <div className="border border-off/15 p-4 bg-navy-dark/40">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="eyebrow text-gold text-[11px] block">Project Photography</span>
                    <span className="text-off/40 text-[10px]">Directly upload photos from your computer</span>
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-gold text-navy-dark px-3 py-1.5 text-xs font-semibold eyebrow hover:bg-gold-light transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>

                {uploading && (
                  <div className="py-3 text-center text-gold text-xs eyebrow flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    <span>Uploading photos to server...</span>
                  </div>
                )}

                {/* Images Preview Grid */}
                {images.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square bg-navy border border-off/20 group overflow-hidden">
                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 eyebrow bg-gold text-navy-dark text-[8px] font-bold px-1">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(img)}
                          className="absolute top-1 right-1 bg-black/80 text-white p-1 hover:bg-red-600 transition-colors"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-off/30 text-center py-4 text-xs italic">
                    No images added yet. Click "Upload Images" to select photos.
                  </p>
                )}
              </div>

              {/* Featured checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="accent-gold w-4 h-4 cursor-pointer"
                />
                <label htmlFor="featuredCheck" className="text-off/80 cursor-pointer select-none">
                  Display as Featured Project on homepage showcase
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-off/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs eyebrow border border-off/20 text-off/70 hover:text-off"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-6 py-2 text-xs eyebrow bg-gold text-navy-dark font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProject ? 'Update Project' : 'Publish Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-navy border border-red-500/30 max-w-sm w-full p-6 text-center shadow-2xl">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h4 className="font-display text-lg text-off font-semibold">Delete Project?</h4>
            <p className="text-off/60 text-xs mt-2 leading-relaxed">
              This action cannot be undone. The project will be removed immediately from the public catalog.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs eyebrow border border-off/20 text-off/70 hover:text-off"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs eyebrow bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
