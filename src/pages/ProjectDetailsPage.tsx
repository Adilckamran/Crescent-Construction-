import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft, 
  Share2, 
  Phone, 
  MessageSquare, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Maximize2
} from 'lucide-react'
import { api, Project } from '../services/api'
import { siteConfig, buildWhatsAppLink } from '../siteConfig'

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [related, setRelated] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (id) {
      loadProject(id)
    }
  }, [id])

  const loadProject = async (projectId: string) => {
    try {
      setLoading(true)
      const res = await api.getProject(projectId)
      setProject(res.project)
      setActiveImageIdx(0)
      setError(null)

      // Fetch related projects in same category
      const listRes = await api.getProjects({ category: res.project.category })
      setRelated(listRes.projects.filter(p => p.id !== res.project.id).slice(0, 3))
    } catch (err: any) {
      console.error('Error loading project details:', err)
      setError('Project not found or temporarily unavailable.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-charcoal min-h-screen pt-32 pb-24 text-off flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="eyebrow text-gold text-xs">Loading Project Details...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="bg-charcoal min-h-screen pt-32 pb-24 text-off">
        <div className="max-w-3xl mx-auto px-6 text-center py-20 border border-off/10 bg-navy-dark">
          <h2 className="font-display text-2xl text-off">Project Not Found</h2>
          <p className="text-off/60 text-sm mt-3">{error || 'The requested project could not be found.'}</p>
          <Link
            to="/projects"
            className="mt-6 inline-flex items-center gap-2 border border-gold text-gold text-xs eyebrow px-6 py-3 hover:bg-gold hover:text-navy-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  const images = project.images && project.images.length > 0 ? project.images : ['/uploads/project-2.jpg']
  const currentImage = images[activeImageIdx] || images[0]

  const whatsappMessage = `Hello Crescent Construction, I am interested in learning more about your project "${project.title}" (${project.category} in ${project.location}).`

  return (
    <div className="bg-charcoal min-h-screen pt-24 lg:pt-28 pb-24 text-off">
      {/* Breadcrumb & Navigation */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 border-b border-off/10">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs eyebrow text-off/60">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <Link to="/projects" className="hover:text-gold transition-colors">Portfolio</Link>
            <span>/</span>
            <span className="text-gold truncate max-w-xs">{project.title}</span>
          </div>

          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-off/70 hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Projects
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-8">
        {/* Title Header */}
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="eyebrow bg-gold text-navy-dark font-bold text-xs px-3 py-1">
              {project.category}
            </span>
            <span className="eyebrow border border-off/20 text-off/70 text-xs px-3 py-1">
              {project.status}
            </span>
            {project.completion_year && (
              <span className="eyebrow text-off/50 text-xs">
                Completed: {project.completion_year}
              </span>
            )}
          </div>

          <h1 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-off leading-tight">
            {project.title}
          </h1>

          <div className="flex items-center gap-2 text-off/60 text-sm mt-3">
            <MapPin className="w-4 h-4 text-gold shrink-0" />
            <span>{project.location}</span>
          </div>
        </div>

        {/* Gallery & Specs Grid */}
        <div className="mt-10 grid lg:grid-cols-12 gap-10">
          {/* Main Gallery Column */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Featured Main Image */}
            <div className="relative aspect-[16/10] bg-navy-dark overflow-hidden border border-off/15 group">
              <img
                src={currentImage}
                alt={project.title}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Lightbox Trigger Button */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute top-4 right-4 bg-navy-dark/80 text-off/80 p-2.5 hover:text-gold hover:bg-navy-dark transition-colors backdrop-blur-sm border border-off/15"
                title="Open full-screen gallery"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Navigation Arrows for Main Gallery */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-navy-dark/80 text-off p-2 hover:text-gold hover:bg-navy-dark transition-colors border border-off/15"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-navy-dark/80 text-off p-2 hover:text-gold hover:bg-navy-dark transition-colors border border-off/15"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 left-4 eyebrow bg-navy-dark/80 text-off/70 text-[10px] px-2.5 py-1 border border-off/10">
                Image {activeImageIdx + 1} of {images.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-24 sm:w-28 aspect-[4/3] shrink-0 overflow-hidden border transition-all ${
                      activeImageIdx === idx
                        ? 'border-gold ring-2 ring-gold/40'
                        : 'border-off/20 opacity-60 hover:opacity-100 hover:border-off/50'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Project Narrative & Details */}
            <div className="mt-8 bg-navy-dark/60 border border-off/10 p-8">
              <span className="eyebrow text-gold text-xs">Scope & Execution</span>
              <h2 className="font-display font-semibold text-2xl text-off mt-2 mb-4">
                Project Overview & Specifications
              </h2>
              <div className="hairline w-16 mb-6" />

              <div className="prose prose-invert max-w-none text-off/80 text-sm sm:text-base leading-relaxed space-y-4">
                <p>{project.full_desc || project.short_desc}</p>
              </div>

              {/* Highlights Checklist */}
              <div className="mt-8 pt-8 border-t border-off/10 grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <span className="text-sm text-off/80">Seismic-grade structural engineering standards</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <span className="text-sm text-off/80">Certified material testing & quality assurance</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <span className="text-sm text-off/80">On-site supervision by qualified civil engineers</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <span className="text-sm text-off/80">Timely milestone delivery & transparent billing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Action / Metadata Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Metadata Card */}
            <div className="bg-navy-dark border border-off/10 p-6 corner-ticks">
              <span className="eyebrow text-gold text-xs">Project Metadata</span>
              <h3 className="font-display text-lg text-off mt-2 mb-4">Key Specifications</h3>
              <div className="hairline w-12 mb-5" />

              <div className="space-y-4 text-sm">
                <div>
                  <span className="eyebrow text-off/40 text-[10px] block">Project Category</span>
                  <span className="font-semibold text-off">{project.category}</span>
                </div>
                <div>
                  <span className="eyebrow text-off/40 text-[10px] block">Site Location</span>
                  <span className="font-semibold text-off">{project.location}</span>
                </div>
                <div>
                  <span className="eyebrow text-off/40 text-[10px] block">Execution Status</span>
                  <span className="font-semibold text-gold">{project.status}</span>
                </div>
                {project.completion_year && (
                  <div>
                    <span className="eyebrow text-off/40 text-[10px] block">Year of Handover</span>
                    <span className="font-semibold text-off">{project.completion_year}</span>
                  </div>
                )}
                <div>
                  <span className="eyebrow text-off/40 text-[10px] block">Contractor</span>
                  <span className="font-semibold text-off">{siteConfig.name}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Card */}
            <div className="bg-navy p-6 border border-gold/30">
              <span className="eyebrow text-gold text-xs">Interested in a similar project?</span>
              <h3 className="font-display text-xl text-off mt-2 mb-3">
                Request an Engineering Quote
              </h3>
              <p className="text-off/70 text-xs leading-relaxed mb-6">
                Consult with our civil engineers directly regarding your upcoming residential, commercial, or waterproofing project.
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href={buildWhatsAppLink(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gold text-navy-dark font-semibold text-xs eyebrow px-5 py-3 hover:bg-gold-light transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Discuss on WhatsApp
                </a>

                <a
                  href={siteConfig.phoneHref}
                  className="inline-flex items-center justify-center gap-2 border border-off/20 text-off font-semibold text-xs eyebrow px-5 py-3 hover:border-gold hover:text-gold transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call {siteConfig.phoneDisplay}
                </a>

                <Link
                  to="/#contact"
                  className="inline-flex items-center justify-center gap-2 border border-gold/60 text-gold text-xs eyebrow px-5 py-3 hover:bg-gold/10 transition-colors"
                >
                  Submit Project Details Form
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related Projects Section */}
        {related.length > 0 && (
          <div className="mt-24 pt-16 border-t border-off/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="eyebrow text-gold text-xs">More in this category</span>
                <h2 className="font-display font-semibold text-2xl sm:text-3xl text-off mt-1">
                  Related Construction Works
                </h2>
              </div>
              <Link
                to="/projects"
                className="text-xs eyebrow text-gold hover:underline hidden sm:block"
              >
                View Full Portfolio →
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rp) => (
                <Link
                  key={rp.id}
                  to={`/projects/${rp.id}`}
                  className="group block bg-navy-dark border border-off/10 overflow-hidden aspect-[4/5] relative"
                >
                  <img
                    src={rp.images?.[0] || '/uploads/project-2.jpg'}
                    alt={rp.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="eyebrow text-gold text-[10px]">{rp.category}</span>
                    <h4 className="font-display text-off text-lg mt-1 group-hover:text-gold transition-colors">
                      {rp.title}
                    </h4>
                    <p className="text-off/60 text-xs mt-1">{rp.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8 backdrop-blur-md">
          <div className="flex items-center justify-between text-off">
            <span className="eyebrow text-gold text-xs">
              {project.title} — ({activeImageIdx + 1} / {images.length})
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="text-off/80 hover:text-white p-2"
              aria-label="Close fullscreen view"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={currentImage}
              alt={project.title}
              className="max-h-[80vh] max-w-[90vw] object-contain"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-navy-dark/60 text-off p-3 hover:text-gold transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-navy-dark/60 text-off p-3 hover:text-gold transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox thumbnails */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 overflow-x-auto py-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-14 h-14 border shrink-0 ${
                    activeImageIdx === idx ? 'border-gold' : 'border-white/20 opacity-50'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
