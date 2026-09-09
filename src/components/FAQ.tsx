import { useState } from 'react'
import { useReveal } from '../hooks/useReveal'

const FAQS = [
  {
    q: 'What areas do you serve?',
    a: 'We serve Karachi and surrounding areas across residential and commercial projects.',
  },
  {
    q: 'Do you provide grey structure construction?',
    a: 'Yes. Grey structure — columns, beams, slabs and framing — is a core part of our construction services.',
  },
  {
    q: 'Do you work on a contract basis?',
    a: 'Yes, projects are carried out on a contract basis, with scope and terms agreed before work begins.',
  },
  {
    q: 'Do you provide waterproofing services?',
    a: 'Yes, including rooftop, terrace, basement, water tank and foundation waterproofing.',
  },
  {
    q: 'Can you provide an estimate before starting?',
    a: 'Yes. After an initial consultation and site visit, we provide an estimate before construction begins.',
  },
  {
    q: 'Do you handle complete house construction?',
    a: 'Yes, from foundation through to finishing and handover, for residential builds.',
  },
  {
    q: 'Can I request a site visit?',
    a: 'Yes, you can request a site visit through our contact form or WhatsApp and our team will schedule it.',
  },
]

export default function FAQ() {
  const ref = useReveal<HTMLDivElement>()
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="bg-off py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <div ref={ref} className="reveal">
          <span className="eyebrow text-gold text-xs">Questions</span>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-navy mt-4 leading-[1.1]">
            Frequently Asked Questions
          </h2>
          <div className="hairline w-24 mt-8" />
        </div>

        <div className="mt-12 border-t border-navy/10">
          {FAQS.map((f, i) => (
            <div key={f.q} className="border-b border-navy/10">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-6 py-6 text-left"
                aria-expanded={open === i}
              >
                <span className="font-display text-lg text-navy">{f.q}</span>
                <span
                  className={`shrink-0 text-gold text-xl transition-transform duration-300 ${
                    open === i ? 'rotate-45' : ''
                  }`}
                  aria-hidden
                >
                  +
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  open === i ? 'max-h-40 pb-6' : 'max-h-0'
                }`}
              >
                <p className="text-charcoal/70 leading-relaxed text-[15px] max-w-2xl">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
