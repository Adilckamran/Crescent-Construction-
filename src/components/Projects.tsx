import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, CheckCircle2 } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import { api, Project } from '../services/api'

import img2 from '../assets/projects/project-2.jpg'
import img3 from '../assets/projects/project-3.jpg'
import img4 from '../assets/projects/project-4.jpg'
import img5 from '../assets/projects/project-5.jpg'
import img6 from '../assets/projects/project-6.jpg'
import img7 from '../assets/projects/project-7.jpg'
import img8 from '../assets/projects/project-8.jpg'
import img9 from '../assets/projects/project-9.jpg'
import img10 from '../assets/projects/project-10.jpg'
import img11 from '../assets/projects/project-11.jpg'
import img12 from '../assets/projects/project-12.jpg'
import img13 from '../assets/projects/project-13.jpg'
import img14 from '../assets/projects/project-14.jpg'
import img15 from '../assets/projects/project-15.jpg'
import img17 from '../assets/projects/project-17.jpg'

const CATEGORIES = ['All', 'Residential', 'Commercial', 'Grey Structure', 'Waterproofing', 'Renovation'] as const
type Category = (typeof CATEGORIES)[number]

const FALLBACK_PROJECTS: any[] = [
  { id: 'proj-1', title: 'Luxury Villa Grey Structure', category: 'Grey Structure', location: 'DHA Phase 8, Karachi', images: [img2] },
  { id: 'proj-2', title: 'Commercial Plaza Framing', category: 'Grey Structure', location: 'Bahria Town, Karachi', images: [img3] },
  { id: 'proj-3', title: 'Engineered Foundation & Piling', category: 'Grey Structure', location: 'Clifton Block 4, Karachi', images: [img4] },
  { id: 'proj-4', title: 'Contemporary Residence', category: 'Residential', location: 'Gulshan-e-Iqbal Block 13-D, Karachi', images: [img5] },
  { id: 'proj-5', title: 'Commercial Finishing Works', category: 'Commercial', location: 'PECHS Block 6, Karachi', images: [img6] },
  { id: 'proj-6', title: 'Architectural Staircase & Renovation', category: 'Renovation', location: 'KDA Scheme 1, Karachi', images: [img7] },
  { id: 'proj-7', title: 'Modern Single-Family Estate', category: 'Residential', location: 'DHA Phase 6, Karachi', images: [img8] },
  { id: 'proj-8', title: 'Retail Showroom Fit-Out', category: 'Commercial', location: 'Tariq Road, Karachi', images: [img9] },
  { id: 'proj-9', title: 'Bespoke Gourmet Kitchen', category: 'Renovation', location: 'Clifton Block 2, Karachi', images: [img10] },
  { id: 'proj-10', title: 'Multi-Unit Residential', category: 'Residential', location: 'Gulistan-e-Jauhar, Karachi', images: [img11] },
  { id: 'proj-11', title: 'Corporate Headquarters', category: 'Commercial', location: 'I.I. Chundrigar Road, Karachi', images: [img12] },
  { id: 'proj-15', title: 'High-Performance Waterproofing', category: 'Waterproofing', location: 'DHA Phase 5, Karachi', images: [img17] },
]

export default function Projects() {
  const ref = useReveal<HTMLDivElement>()
  const [active, setActive] = useState<Category>('All')
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS as any)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getProjects()
      .then(res => {
        if (res.projects && res.projects.length > 0) {
          setProjects(res.projects)
        }
      })
      .catch(() => {
        // Fallback already pre-set
      })
  }, [])

  const filtered = useMemo(
    () => (active === 'All' ? projects : projects.filter((p) => p.category === active)),
    [active, projects],
  )

  // Show up to 6 on homepage for optimal performance
  const displayList = filtered.slice(0, 6)

  return (
    <section id="projects" className="bg-charcoal py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div ref={ref} className="reveal flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div>
            <span className="eyebrow text-gold text-xs">Portfolio</span>
            <h2 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-off mt-4 leading-[1.1]">
              Our Recent Work
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-4 py-2 text-xs eyebrow border transition-colors duration-300 ${
                  active === cat
                    ? 'bg-gold text-navy-dark border-gold'
                    : 'border-off/20 text-off/60 hover:border-gold hover:text-gold'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-off/50 text-sm mt-14">No projects in this category yet — check back soon.</p>
        ) : (
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayList.map((p, i) => {
              const coverImg = p.images?.[0] || img2
              return (
                <Link
                  to={`/projects/${p.id}`}
                  key={p.id || p.title + i}
                  className="group block relative overflow-hidden aspect-[4/5] bg-navy-dark border border-off/10 hover:border-gold/50 transition-all duration-300"
                >
                  <img
                    src={coverImg}
                    alt={`${p.category} construction project in Karachi`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 via-navy-dark/30 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="eyebrow text-gold text-[10px] bg-navy-dark/80 px-2.5 py-1 border border-gold/30">
                      {p.category}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-off text-xl mt-2 group-hover:text-gold transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-off/60 text-sm mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                      {p.location}
                    </p>
                    <div className="mt-3 pt-3 border-t border-off/10 flex items-center justify-between text-xs text-gold eyebrow">
                      <span>View Specifications</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* View All Projects CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 border border-gold text-gold text-xs eyebrow px-8 py-4 hover:bg-gold hover:text-navy-dark transition-all duration-300"
          >
            Explore Complete Portfolio ({projects.length} Works)
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
