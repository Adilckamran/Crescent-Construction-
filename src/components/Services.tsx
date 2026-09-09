import type { ReactElement } from 'react'
import { useState } from 'react'
import { useReveal } from '../hooks/useReveal'

const ICON_PROPS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 48 48',
}

const SERVICES: {
  n: string
  title: string
  desc: string
  icon: ReactElement
  cta?: string
}[] = [
  {
    n: '01',
    title: 'Grey Structure',
    desc: 'Column, beam, slab and structural framing carried out to engineering specification.',
    icon: (
      <svg {...ICON_PROPS} className="w-8 h-8">
        <path d="M8 40V14l16-8 16 8v26" />
        <path d="M8 40h32M16 40V20M24 40V16M32 40V20" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Complete House Construction',
    desc: 'End-to-end residential builds — from foundation to final handover.',
    icon: (
      <svg {...ICON_PROPS} className="w-8 h-8">
        <path d="M6 22 24 8l18 14" />
        <path d="M10 20v20h28V20" />
        <path d="M20 40V28h8v12" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Civil Works',
    desc: 'Site development, boundary walls, drainage and general civil engineering works.',
    icon: (
      <svg {...ICON_PROPS} className="w-8 h-8">
        <path d="M6 38h36" />
        <path d="M10 38V22l14-10 14 10v16" />
        <path d="M18 38V26h12v12" />
      </svg>
    ),
  },
  {
    n: '04',
    title: 'Structural & Concrete Work',
    desc: 'Reinforced concrete work engineered for load-bearing accuracy and durability.',
    icon: (
      <svg {...ICON_PROPS} className="w-8 h-8">
        <rect x="8" y="14" width="32" height="20" />
        <path d="M8 20h32M8 28h32M16 14v20M24 14v20M32 14v20" />
      </svg>
    ),
  },
  {
    n: '05',
    title: 'Waterproofing',
    desc: 'Roof, terrace, basement and water-tank waterproofing against seepage and damage.',
    icon: (
      <svg {...ICON_PROPS} className="w-8 h-8">
        <path d="M24 6c6 9 10 15 10 21a10 10 0 1 1-20 0c0-6 4-12 10-21Z" />
      </svg>
    ),
  },
  {
    n: '06',
    title: 'Foundation Work',
    desc: 'Footings and foundation systems engineered for site-specific soil conditions.',
    icon: (
      <svg {...ICON_PROPS} className="w-8 h-8">
        <path d="M12 38V18l12-8 12 8v20" />
        <path d="M6 38h36" />
        <path d="M12 38v-8M36 38v-8" />
      </svg>
    ),
  },
  {
    n: '07',
    title: 'Renovation',
    desc: 'Structural and cosmetic renovation for existing residential and commercial spaces.',
    icon: (
      <svg {...ICON_PROPS} className="w-8 h-8">
        <path d="M30 8 40 18 20 38l-10 2 2-10Z" />
        <path d="M26 12l10 10" />
      </svg>
    ),
  },
  {
    n: '08',
    title: 'Finishing Works',
    desc: 'Flooring, plaster, paint and interior finishing carried through to final detail.',
    icon: (
      <svg {...ICON_PROPS} className="w-8 h-8">
        <rect x="8" y="8" width="32" height="32" />
        <path d="M8 20h32M20 20v20" />
      </svg>
    ),
  },
  {
    n: '09',
    title: 'Structural Drawing Review',
    desc: 'Reviewing drawings before construction begins to check coordination and clarify structural requirements.',
    icon: (
      <svg {...ICON_PROPS} className="w-8 h-8">
        <rect x="8" y="6" width="32" height="36" />
        <path d="M14 14h20M14 20h20M14 26h12" />
        <path d="M28 30l4 4-4 4" />
      </svg>
    ),
    cta: 'Discuss Your Project',
  },
]

export default function Services() {
  const ref = useReveal<HTMLDivElement>()
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section id="services" className="bg-navy py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-[0.15]" />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
        <div ref={ref} className="reveal max-w-2xl">
          <span className="eyebrow text-gold text-xs">What We Do</span>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-off mt-4 leading-[1.1]">
            Construction Services in Karachi
          </h2>
          <div className="hairline w-24 mt-8" />
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-off/10">
          {SERVICES.map((s, i) => (
            <div
              key={s.title}
              onMouseEnter={() => setOpenIdx(i)}
              onMouseLeave={() => setOpenIdx(null)}
              className="group relative border-r border-b border-off/10 p-8 min-h-[240px] flex flex-col justify-between transition-colors duration-300 hover:bg-navy-dark/60"
            >
              <div className="flex items-start justify-between">
                <span className="eyebrow text-off/30 text-[11px]">{s.n}</span>
                <span className="text-gold">{s.icon}</span>
              </div>
              <div>
                <h3 className="font-display text-lg text-off mt-6 leading-snug">{s.title}</h3>
                <p
                  className={`text-off/60 text-sm mt-3 leading-relaxed overflow-hidden transition-all duration-300 ${
                    openIdx === i ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0 lg:max-h-32 lg:opacity-100'
                  }`}
                >
                  {s.desc}
                </p>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-gold text-xs eyebrow mt-5 group-hover:gap-3 transition-all"
                >
                  {s.cta ?? 'Learn More'}
                  <span aria-hidden>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
