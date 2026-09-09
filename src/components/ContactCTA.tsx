import { useReveal } from '../hooks/useReveal'
import { siteConfig } from '../siteConfig'

export default function ContactCTA() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className="relative bg-navy py-24 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-[0.15]" />
      <div ref={ref} className="reveal relative max-w-4xl mx-auto px-6 lg:px-10 text-center">
        <h2 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-off leading-[1.1] text-balance">
          Let's Build Something That Lasts.
        </h2>
        <p className="text-off/70 mt-5 max-w-xl mx-auto leading-relaxed">
          Tell us about your project and our team will get back to you.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="#contact"
            className="inline-flex justify-center items-center gap-2 bg-gold text-navy-dark font-semibold text-sm tracking-wide px-8 py-4 hover:bg-gold-light transition-colors duration-300"
          >
            Request a Free Quote
          </a>
          <a
            href={siteConfig.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center items-center gap-2 border border-off/40 text-off font-semibold text-sm tracking-wide px-8 py-4 hover:border-gold hover:text-gold transition-colors duration-300"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
