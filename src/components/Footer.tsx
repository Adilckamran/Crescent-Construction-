import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import { siteConfig } from '../siteConfig'

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/#services' },
  { label: 'Portfolio (Projects)', to: '/projects' },
  { label: 'Request A Quote', to: '/#contact' },
  { label: 'Client / Admin Login', to: '/login' },
]

export default function Footer() {
  return (
    <footer className="bg-navy-dark pt-20 pb-8 text-off">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-3 gap-12 pb-14 border-b border-off/10">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-off shadow-sm ring-1 ring-gold/30 p-1.5">
                <img src={logo} alt="Crescent Construction" className="w-full h-full object-contain" />
              </span>
              <span className="font-display text-off text-lg font-semibold">{siteConfig.name}</span>
            </div>
            <p className="eyebrow text-gold text-[11px] mt-4">{siteConfig.tagline}</p>
            <p className="text-off/50 text-sm mt-4 max-w-xs leading-relaxed">
              Engineering-led residential and commercial construction, grey structure, civil works, and specialized waterproofing in Karachi, Pakistan.
            </p>
          </div>

          <div>
            <p className="eyebrow text-off/40 text-[11px] mb-5">Quick Links</p>
            <div className="flex flex-col gap-3">
              {QUICK_LINKS.map((l) => (
                <Link key={l.label} to={l.to} className="text-off/70 text-sm hover:text-gold transition-colors w-fit">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow text-off/40 text-[11px] mb-5">Official Office</p>
            <div className="flex flex-col gap-3 text-sm text-off/70">
              <p className="max-w-[240px] leading-relaxed">{siteConfig.address}</p>
              <a href={siteConfig.phoneHref} className="hover:text-gold transition-colors w-fit font-medium">
                Phone: {siteConfig.phoneDisplay}
              </a>
              <a
                href={siteConfig.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors w-fit"
              >
                WhatsApp: {siteConfig.whatsappDisplay}
              </a>
              <a href={siteConfig.emailHref} className="hover:text-gold transition-colors w-fit break-all">
                {siteConfig.email}
              </a>
              <a
                href={siteConfig.directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors w-fit eyebrow text-[11px] mt-1"
              >
                Get Directions →
              </a>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <SocialIcon label="Facebook" href={siteConfig.social.facebook}>
                <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v6h3v-6h3l1-3h-4v-2c0-.6.4-1 1-1Z" />
              </SocialIcon>
              <SocialIcon label="Instagram" href={siteConfig.social.instagram}>
                <rect x="4" y="4" width="16" height="16" rx="4" />
                <circle cx="12" cy="12" r="3.5" />
                <circle cx="16.5" cy="7.5" r="0.8" fill="currentColor" stroke="none" />
              </SocialIcon>
              <SocialIcon label="WhatsApp" href={siteConfig.whatsappHref}>
                <path d="M12 4a8 8 0 0 0-6.9 12l-1 4 4.1-1A8 8 0 1 0 12 4Z" />
                <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l.7-1.4-1.9-1-1 .6A5 5 0 0 1 9.9 10l.6-1L9.5 7 8 8c0 .5.1 1 .5 1.5Z" fill="currentColor" stroke="none" />
              </SocialIcon>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-off/40 gap-4">
          <p>© {new Date().getFullYear()} Crescent Construction. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Karachi, Pakistan</span>
            <span>•</span>
            <Link to="/login" className="hover:text-gold transition-colors">Portal Access</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 border border-off/20 flex items-center justify-center text-off/70 hover:text-gold hover:border-gold transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-4 h-4">
        {children}
      </svg>
    </a>
  )
}
