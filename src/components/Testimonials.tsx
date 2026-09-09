import { useReveal } from '../hooks/useReveal'

// Clearly-labeled sample reviews — NOT real customer testimonials.
// Replace each `quote`, `type` and remove `sample: true` once real,
// permissioned client feedback is available.
const REVIEWS = [
  {
    sample: true,
    label: ' Review 01',
    type: 'Residential Construction Client',
    location: 'Karachi',
    quote:
      'Professional communication, clear guidance and good attention to the construction work. The team was helpful throughout the project.',
  },
  {
    sample: true,
    label: ' Review 02',
    type: 'Home Construction Client',
    location: 'Karachi',
    quote:
      "We appreciated the team's approach to planning and execution. Communication was straightforward and the work was handled professionally.",
  },
  {
    sample: true,
    label: ' Review 03',
    type: 'Waterproofing Client',
    location: 'Karachi',
    quote:
      'The team explained the waterproofing work clearly and handled the site professionally. Overall, the experience was smooth.',
  },
]

export default function Testimonials() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className="bg-off py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div ref={ref} className="reveal max-w-2xl">
          <span className="eyebrow text-gold text-xs">Client Feedback</span>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-navy mt-4 leading-[1.1]">
            What Clients Say
          </h2>
          <div className="hairline w-24 mt-8" />
          <p className="text-charcoal/60 text-sm mt-4">
            We believe our work speaks for itself. Clients are welcome to visit our completed and ongoing project sites and see the quality of our work firsthand. Client references and feedback can also be shared upon request
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div key={r.label} className="relative bg-white border border-navy/10 p-8 flex flex-col justify-between">
              <span className="absolute top-4 right-4 eyebrow text-gold/70 text-[9px] border border-gold/40 px-2 py-1">
                 Review
              </span>
              <p className="text-charcoal/60 italic leading-relaxed text-[15px] pr-16">"{r.quote}"</p>
              <div className="hairline w-12 mt-8 mb-5" />
              <div>
                <p className="font-display text-navy">{r.label}</p>
                <p className="eyebrow text-navy/40 text-[11px] mt-1">
                  {r.type} — {r.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
