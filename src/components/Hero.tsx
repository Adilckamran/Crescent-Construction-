import { siteConfig } from '../siteConfig'

export default function Hero() {
  return (
    <section id="home" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      {/* Background photograph */}
      <img
        src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2069&auto=format&fit=crop"
        alt="Construction site with tower crane under a dramatic sky"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/85 via-navy-dark/70 to-navy-dark" />
      <div className="absolute inset-0 grid-overlay opacity-40" />

      <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-end pb-24 lg:pb-28 pt-32">
        <span className="eyebrow text-gold text-xs mb-6">
          Crescent Construction — Karachi, Pakistan
        </span>

        <h1 className="font-display font-semibold text-off text-[13vw] leading-[0.98] sm:text-6xl lg:text-[5.5rem] tracking-tight text-balance max-w-4xl">
          Building Today,
          <br />
          Creating Tomorrow.
        </h1>

        <p className="mt-6 text-off/75 text-base lg:text-lg max-w-xl leading-relaxed">
          Professional construction and civil works in Karachi, built around quality, precision and long-term
          durability.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <a
            href="#contact"
            className="inline-flex justify-center items-center gap-2 bg-gold text-navy-dark font-semibold text-sm tracking-wide px-8 py-4 hover:bg-gold-light transition-colors duration-300"
          >
            Get a Free Quote
          </a>
          <a
            href={siteConfig.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center items-center gap-2 border border-off/40 text-off font-semibold text-sm tracking-wide px-8 py-4 hover:border-gold hover:text-gold transition-colors duration-300"
          >
            WhatsApp Us
          </a>
        </div>

        <div className="mt-10 flex items-center gap-3 text-off/60 eyebrow text-[11px]">
          <span>Residential</span>
          <span className="w-1 h-1 bg-gold rounded-full" />
          <span>Commercial</span>
          <span className="w-1 h-1 bg-gold rounded-full" />
          <span>Civil Works</span>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 right-6 lg:right-10 hidden sm:flex flex-col items-center gap-3">
        <span className="eyebrow text-off/50 text-[10px] [writing-mode:vertical-rl]">Scroll</span>
        <span className="w-px h-12 bg-gradient-to-b from-gold to-transparent" />
      </div>
    </section>
  )
}
