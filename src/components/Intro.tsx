import { useReveal } from '../hooks/useReveal'
import siteImage from '../assets/projects/project-1.jpg'

export default function Intro() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section id="about" className="bg-off py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        <div ref={ref} className="reveal">
          <span className="eyebrow text-gold text-xs">Who We Are</span>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-navy mt-4 leading-[1.1] text-balance">
            Built With Purpose.
            <br />
            Delivered With Precision.
          </h2>
          <div className="hairline w-24 mt-8 mb-8" />
          <p className="text-charcoal/80 leading-relaxed text-base lg:text-lg">
            Crescent Construction handles residential and commercial construction and civil work
            across Karachi — from grey structure and foundation work to structural concrete,
            waterproofing and finishing. Every project is approached with close attention to
            structural quality, the materials we specify and the way work is sequenced and
            supervised on site.
          </p>
          <p className="mt-5 text-charcoal/80 leading-relaxed text-base lg:text-lg">
            We work directly with property owners and businesses, keeping communication clear and
            execution accountable from the first site visit through to handover.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-6 max-w-md">
            <div>
              <p className="eyebrow text-navy/50 text-[11px] mb-2">Based In</p>
              <p className="font-display text-xl text-navy">Karachi, PK</p>
            </div>
            <div>
              <p className="eyebrow text-navy/50 text-[11px] mb-2">Scope Of Work</p>
              <p className="font-display text-xl text-navy">Res. &amp; Commercial</p>
            </div>
          </div>
        </div>

        <div className="reveal corner-ticks p-2" style={{ transitionDelay: '120ms' }}>
          <div className="relative overflow-hidden aspect-[4/5]">
            <img
              src={siteImage}
              alt="Foundation and reinforcement steel work on a Crescent Construction site in Karachi"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
