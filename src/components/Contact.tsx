import type { FormEvent } from 'react'
import { useState } from 'react'
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  ArrowRight,
  Clock
} from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import { siteConfig, buildWhatsAppLink } from '../siteConfig'
import { api } from '../services/api'

const PROJECT_TYPES = [
  'Complete House Construction',
  'Grey Structure',
  'Civil Works',
  'Structural Work',
  'Waterproofing',
  'Renovation',
  'Finishing Works',
  'Commercial Construction',
  'Other',
]

export default function Contact() {
  const ref = useReveal<HTMLDivElement>()

  // Form states
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0])
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [message, setMessage] = useState('')
  const [gotcha, setGotcha] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Basic validation
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError('Please provide your Full Name, Phone Number, and Email Address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email address (e.g. name@example.com).')
      return
    }

    const cleanPhone = phone.trim().replace(/[^0-9+]/g, '')
    if (cleanPhone.length < 8) {
      setError('Please provide a valid phone number.')
      return
    }

    try {
      setSubmitting(true)
      await api.submitContact({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        project_type: projectType,
        location: location.trim(),
        budget: budget.trim(),
        message: message.trim() || 'No additional message provided.',
        _gotcha: gotcha,
      })

      setSubmitted(true)
      // Clear form
      setName('')
      setPhone('')
      setEmail('')
      setLocation('')
      setBudget('')
      setMessage('')
    } catch (err: any) {
      console.error('Contact submission error:', err)
      setError(
        err?.message ||
          'Unable to submit inquiry at this moment. Please call or message us directly on WhatsApp.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDirectWhatsApp = () => {
    const text =
      `Hello Crescent Construction,\n\n` +
      `I would like to inquire about a project:\n` +
      `Name: ${name || 'Prospective Client'}\n` +
      `Phone: ${phone || '—'}\n` +
      `Project Type: ${projectType}\n` +
      `Location: ${location || 'Karachi'}\n` +
      `Budget: ${budget || '—'}\n\n` +
      `Message: ${message || 'Please contact me regarding construction services.'}`

    window.open(buildWhatsAppLink(text), '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="contact" className="bg-off py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div ref={ref} className="reveal max-w-2xl">
          <span className="eyebrow text-gold text-xs">Get In Touch</span>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-navy mt-4 leading-[1.1]">
            Request A Quote
          </h2>
          <div className="hairline w-24 mt-8" />
          <p className="text-charcoal/70 text-sm mt-4 leading-relaxed">
            Send us your project details for an engineering estimate or site consultation. Every inquiry is delivered directly to our official inbox and team desk.
          </p>
        </div>

        <div className="mt-14 grid lg:grid-cols-5 gap-12">
          {/* Details + map */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            <div>
              <p className="font-display text-xl text-navy font-semibold">{siteConfig.name}</p>
              <p className="text-charcoal/70 mt-1.5 max-w-xs leading-relaxed text-sm">{siteConfig.address}</p>
            </div>

            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-center gap-3">
                <span className="eyebrow text-navy/40 text-[11px] w-20 shrink-0">Phone</span>
                <a href={siteConfig.phoneHref} className="text-charcoal font-medium hover:text-gold transition-colors">
                  {siteConfig.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="eyebrow text-navy/40 text-[11px] w-20 shrink-0">WhatsApp</span>
                <a
                  href={siteConfig.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-charcoal font-medium hover:text-gold transition-colors"
                >
                  {siteConfig.whatsappDisplay}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="eyebrow text-navy/40 text-[11px] w-20 shrink-0">Email</span>
                <a href={siteConfig.emailHref} className="text-charcoal hover:text-gold transition-colors break-all">
                  {siteConfig.email}
                </a>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={siteConfig.phoneHref}
                className="inline-flex items-center justify-center gap-2 bg-navy text-off text-xs font-semibold tracking-wide px-4 py-3 hover:bg-navy-dark transition-colors"
              >
                Call Now
              </a>
              <a
                href={siteConfig.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gold text-navy-dark text-xs font-semibold tracking-wide px-4 py-3 hover:bg-gold-light transition-colors"
              >
                WhatsApp Us
              </a>
              <a
                href={siteConfig.emailHref}
                className="inline-flex items-center justify-center gap-2 border border-navy/20 text-navy text-xs font-semibold tracking-wide px-4 py-3 hover:border-gold hover:text-gold transition-colors"
              >
                Email Us
              </a>
              <a
                href={siteConfig.directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-navy/20 text-navy text-xs font-semibold tracking-wide px-4 py-3 hover:border-gold hover:text-gold transition-colors"
              >
                Get Directions
              </a>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              <span className="eyebrow text-navy/40 text-[11px] mr-2">Official Profiles:</span>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 border border-navy/15 flex items-center justify-center text-navy/60 hover:text-gold hover:border-gold transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-4 h-4">
                  <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v6h3v-6h3l1-3h-4v-2c0-.6.4-1 1-1Z" />
                </svg>
              </a>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 border border-navy/15 flex items-center justify-center text-navy/60 hover:text-gold hover:border-gold transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-4 h-4">
                  <rect x="4" y="4" width="16" height="16" rx="4" />
                  <circle cx="12" cy="12" r="3.5" />
                  <circle cx="16.5" cy="7.5" r="0.8" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>

            {/* Map */}
            <div className="relative aspect-[4/3] bg-navy/5 border border-navy/10 overflow-hidden">
              {siteConfig.mapsEmbedSrc ? (
                <iframe
                  title="Crescent Construction Office Location"
                  src={siteConfig.mapsEmbedSrc}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              ) : (
                <div className="relative text-center p-6 flex flex-col items-center justify-center h-full">
                  <MapPin className="w-8 h-8 text-gold mb-2" />
                  <p className="font-medium text-navy text-sm">{siteConfig.address}</p>
                  <a
                    href={siteConfig.directionsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-gold eyebrow text-xs hover:underline"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-white border-2 border-gold p-8 sm:p-12 text-center shadow-lg">
                <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-display font-semibold text-2xl sm:text-3xl text-navy">
                  Inquiry Submitted Successfully!
                </h3>
                <p className="text-charcoal/70 text-sm mt-3 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. Your project specifications have been sent to our engineering office at{' '}
                  <strong className="text-navy">{siteConfig.email}</strong>. Our team will review your requirements and contact you shortly.
                </p>

                <div className="mt-8 pt-6 border-t border-navy/10 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="border border-navy/30 text-navy font-semibold text-xs eyebrow px-6 py-3 hover:border-gold hover:text-gold transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                  <a
                    href={siteConfig.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gold text-navy-dark font-semibold text-xs eyebrow px-6 py-3 hover:bg-gold-light transition-colors"
                  >
                    Continue on WhatsApp →
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-6 bg-white p-6 sm:p-8 border border-navy/10 shadow-sm">
                {error && (
                  <div className="sm:col-span-2 bg-red-50 border border-red-200 text-red-700 p-4 text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Honeypot field (hidden from humans) */}
                <input
                  type="text"
                  name="_gotcha"
                  value={gotcha}
                  onChange={(e) => setGotcha(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div>
                  <label htmlFor="name" className="eyebrow text-navy/50 text-[11px] block mb-2">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Muhammad Farooq"
                    className="w-full bg-off/50 border border-navy/15 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="eyebrow text-navy/50 text-[11px] block mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0300 1234567"
                    className="w-full bg-off/50 border border-navy/15 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="email" className="eyebrow text-navy/50 text-[11px] block mb-2">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-off/50 border border-navy/15 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="projectType" className="eyebrow text-navy/50 text-[11px] block mb-2">
                    Project Type
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full bg-off/50 border border-navy/15 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className="eyebrow text-navy/50 text-[11px] block mb-2">
                    Project Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. DHA Phase 8, Karachi"
                    className="w-full bg-off/50 border border-navy/15 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="budget" className="eyebrow text-navy/50 text-[11px] block mb-2">
                    Estimated Budget / Scope (Optional)
                  </label>
                  <input
                    id="budget"
                    name="budget"
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 500 sq yds / PKR 30-50 lac"
                    className="w-full bg-off/50 border border-navy/15 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="message" className="eyebrow text-navy/50 text-[11px] block mb-2">
                    Project Requirements / Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your construction requirements, timeline, architectural drawings status, etc."
                    className="w-full bg-off/50 border border-navy/15 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors resize-none"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 bg-gold text-navy-dark font-semibold text-xs eyebrow px-8 py-4 hover:bg-gold-light transition-colors duration-300 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-navy-dark border-t-transparent rounded-full animate-spin" />
                        Transmitting Inquiry...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Project Inquiry
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectWhatsApp}
                    className="inline-flex items-center justify-center gap-2 border border-navy/20 text-navy font-semibold text-xs eyebrow px-6 py-4 hover:border-gold hover:text-gold transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-gold" />
                    Quick WhatsApp Discussion
                  </button>
                </div>

                <p className="sm:col-span-2 text-charcoal/50 text-[11px] leading-relaxed pt-2 border-t border-navy/10">
                  🔒 Your submission is encrypted and securely routed to our office inbox ({siteConfig.email}) and recorded in our client registry.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
