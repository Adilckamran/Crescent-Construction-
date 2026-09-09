import { useReveal } from '../hooks/useReveal'

const POINTS = [
  {
    n: '01',
    title: 'Quality Workmanship',
    desc: 'Skilled site teams and specified materials, checked at every stage of the build.',
  },
  {
    n: '02',
    title: 'Reliable Project Execution',
    desc: 'Clear scheduling and site supervision so work progresses the way it was planned.',
  },
  {
    n: '03',
    title: 'Professional Construction Practices',
    desc: 'Documented processes for structural work, safety and material handling on site.',
  },
  {
    n: '04',
    title: 'Built For Long-Term Durability',
    desc: 'Structural and waterproofing decisions made for the building\u2019s life, not just its handover.',
  },
]

export default function WhyUs() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section id="why-us" className="bg-off py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div ref={ref} className="reveal max-w-2xl">
          <span className="eyebrow text-gold text-xs">Our Standard</span>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-navy mt-4 leading-[1.1]">
            Why Build With Crescent?
          </h2>
          <div className="hairline w-24 mt-8" />
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-x-14 gap-y-12">
          {POINTS.map((p) => (
            <div key={p.n} className="flex gap-6 border-t border-navy/10 pt-6">
              <span className="font-display text-3xl text-gold/80 shrink-0 w-14">{p.n}</span>
              <div>
                <h3 className="font-display text-xl text-navy">{p.title}</h3>
                <p className="text-charcoal/70 mt-2 leading-relaxed text-[15px]">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
