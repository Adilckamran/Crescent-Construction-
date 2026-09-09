import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, ArrowRight, Building2, MapPin, Calendar, CheckCircle2 } from 'lucide-react'
import { api, Project } from '../services/api'
import { useReveal } from '../hooks/useReveal'

const CATEGORIES = ['All', 'Residential', 'Commercial', 'Grey Structure', 'Waterproofing', 'Renovation'] as const

export default function ProjectsPage() {
  const ref = useReveal<HTMLDivElement>()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCat, setActiveCat] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'In Progress'>('All')

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const res = await api.getProjects()
      setProjects(res.projects)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching projects:', err)
      setError('Unable to load projects from server. Showing cached catalog.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchCat = activeCat === 'All' || p.category.toLowerCase() === activeCat.toLowerCase()
      const matchStatus = statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase()
      const matchSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.short_desc.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchStatus && matchSearch
    })
  }, [projects, activeCat, statusFilter, searchQuery])

  return (
    <div className="bg-charcoal min-h-screen pt-28 pb-24 text-off">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-12">
        <div ref={ref} className="reveal max-w-3xl">
          <div className="flex items-center gap-2 text-gold text-xs eyebrow mb-3">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span>Projects Portfolio</span>
          </div>
          <h1 className="font-display font-semibold text-3xl sm:text-5xl lg:text-6xl text-off leading-tight">
            Our Construction Portfolio
          </h1>
          <div className="hairline w-24 mt-6 mb-4" />
          <p className="text-off/70 text-base sm:text-lg leading-relaxed mt-4">
            Explore our residential, commercial, grey structure, and specialized waterproofing projects executed across Karachi to structural precision and engineering rigor.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-12 bg-navy-dark/80 border border-off/10 p-6 rounded-none backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-off/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, location or keywords..."
                className="w-full bg-charcoal border border-off/15 pl-10 pr-4 py-2.5 text-sm text-off placeholder:text-off/30 focus:outline-none focus:border-gold transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="eyebrow text-off/50 text-[11px] hidden sm:inline">Status:</span>
              <div className="flex gap-1.5 bg-charcoal p-1 border border-off/15">
                {(['All', 'Completed', 'In Progress'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 text-xs eyebrow transition-colors ${
                      statusFilter === st
                        ? 'bg-gold text-navy-dark font-semibold'
                        : 'text-off/60 hover:text-gold'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-6 pt-5 border-t border-off/10 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-4 py-2 text-xs eyebrow border transition-all duration-300 ${
                  activeCat === cat
                    ? 'bg-gold text-navy-dark border-gold font-semibold shadow-sm'
                    : 'border-off/20 text-off/70 hover:border-gold hover:text-gold'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse bg-navy/40 border border-off/10 aspect-[4/5] p-6 flex flex-col justify-end">
                <div className="h-4 bg-off/20 rounded w-1/3 mb-3" />
                <div className="h-6 bg-off/20 rounded w-3/4 mb-2" />
                <div className="h-4 bg-off/20 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-off/15 bg-navy-dark/40 p-12">
            <Building2 className="w-12 h-12 text-gold/40 mx-auto mb-4" />
            <h3 className="font-display text-xl text-off">No projects match your filter</h3>
            <p className="text-off/50 text-sm mt-2 max-w-md mx-auto">
              Try adjusting your search terms or clearing your category filters to view available works.
            </p>
            <button
              onClick={() => {
                setActiveCat('All')
                setStatusFilter('All')
                setSearchQuery('')
              }}
              className="mt-6 border border-gold text-gold text-xs eyebrow px-6 py-2.5 hover:bg-gold hover:text-navy-dark transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p) => {
              const primaryImage = p.images?.[0] || '/uploads/project-2.jpg'
              return (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="group block relative overflow-hidden bg-navy-dark border border-off/10 aspect-[4/5] transition-all duration-300 hover:border-gold/60 hover:shadow-xl hover:shadow-black/40"
                >
                  {/* Background Image */}
                  <img
                    src={primaryImage}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="eyebrow bg-navy-dark/90 text-gold text-[10px] px-3 py-1 border border-gold/40 backdrop-blur-sm">
                      {p.category}
                    </span>
                    {p.featured && (
                      <span className="eyebrow bg-gold text-navy-dark text-[10px] font-bold px-2.5 py-1">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Bottom Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-2 text-off/60 text-xs mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span className="truncate">{p.location}</span>
                    </div>

                    <h3 className="font-display text-off text-xl font-semibold leading-snug group-hover:text-gold transition-colors">
                      {p.title}
                    </h3>

                    <p className="text-off/60 text-xs line-clamp-2 mt-2 leading-relaxed">
                      {p.short_desc}
                    </p>

                    <div className="mt-4 pt-3 border-t border-off/10 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-off/50 eyebrow text-[10px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-gold/80" />
                        {p.status} {p.completion_year ? `• ${p.completion_year}` : ''}
                      </span>
                      <span className="inline-flex items-center gap-1 text-gold font-medium group-hover:translate-x-1 transition-transform">
                        View Project
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
