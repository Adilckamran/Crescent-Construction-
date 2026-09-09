import { useReveal } from '../hooks/useReveal'

const STEPS = [
  { n: '01', title: 'Consultation', desc: 'Understanding your site, requirements and budget.' },
  { n: '02', title: 'Planning & Drawings', desc: 'Structural planning and drawings prepared for approval.' },
  { n: '03', title: 'Estimation & Scheduling', desc: 'Costing and a realistic construction timeline.' },
  { n: '04', title: 'Construction', desc: 'Site execution, supervised through every phase of work.' },
  { n: '05', title: 'Handover', desc: 'Final inspection, finishing checks and project handover.' },
]

export default function Process() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className="bg-off py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div ref={ref} className="reveal max-w-2xl">
          <span className="eyebrow text-gold text-xs">How We Work</span>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-navy mt-4 leading-[1.1]">
            Our Construction Process
          </h2>
          <div className="hairline w-24 mt-8" />
        </div>

        {/* Desktop horizontal timeline */}
        <div className="hidden lg:block mt-20">
          <div className="relative grid grid-cols-5 gap-6">
            <div className="absolute top-[13px] left-0 right-0 h-px bg-navy/15" />
            {STEPS.map((s) => (
              <div key={s.n} className="relative pt-10">
                <span className="absolute top-0 left-0 w-[26px] h-[26px] rounded-full bg-off border-2 border-gold flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-gold" />
                </span>
                <span className="eyebrow text-navy/30 text-[11px]">{s.n}</span>
                <h3 className="font-display text-lg text-navy mt-2">{s.title}</h3>
                <p className="text-charcoal/70 text-sm mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="lg:hidden mt-14 relative pl-8">
          <div className="absolute top-1 left-[7px] bottom-1 w-px bg-navy/15" />
          <div className="flex flex-col gap-10">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <span className="absolute -left-8 top-0.5 w-[15px] h-[15px] rounded-full bg-off border-2 border-gold" />
                <span className="eyebrow text-navy/30 text-[11px]">{s.n}</span>
                <h3 className="font-display text-lg text-navy mt-1">{s.title}</h3>
                <p className="text-charcoal/70 text-sm mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
