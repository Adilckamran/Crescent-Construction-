import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { User, LogOut, Shield, ChevronDown } from 'lucide-react'
import logo from '../assets/logo.png'
import { siteConfig } from '../siteConfig'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAdmin, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isHome = location.pathname === '/'

  const handleNavClick = (href: string) => {
    setOpen(false)
    if (href.startsWith('#')) {
      if (isHome) {
        const el = document.querySelector(href)
        el?.scrollIntoView({ behavior: 'smooth' })
      } else {
        navigate(`/${href}`)
      }
    }
  }

  const handleLogout = () => {
    logout()
    setUserDropdown(false)
    setOpen(false)
    navigate('/')
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-navy-dark/95 backdrop-blur-md shadow-lg shadow-black/20' : 'bg-gradient-to-b from-navy-dark/80 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <span className="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-off shadow-sm ring-1 ring-gold/30 p-1.5">
              <img src={logo} alt="Crescent Construction" className="w-full h-full object-contain" />
            </span>
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="font-display font-semibold text-off text-lg tracking-wide">
                {siteConfig.name}
              </span>
              <span className="eyebrow text-gold text-[10px] leading-none mt-1">
                {siteConfig.tagline}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium tracking-wide transition-colors relative group ${
                isHome ? 'text-gold' : 'text-off/85 hover:text-gold'
              }`}
            >
              Home
              <span className="absolute -bottom-1.5 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>

            <button
              onClick={() => handleNavClick('#about')}
              className="text-off/85 text-sm font-medium tracking-wide hover:text-gold transition-colors relative group"
            >
              About
              <span className="absolute -bottom-1.5 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
            </button>

            <button
              onClick={() => handleNavClick('#services')}
              className="text-off/85 text-sm font-medium tracking-wide hover:text-gold transition-colors relative group"
            >
              Services
              <span className="absolute -bottom-1.5 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
            </button>

            <Link
              to="/projects"
              className={`text-sm font-medium tracking-wide transition-colors relative group ${
                location.pathname.startsWith('/projects') ? 'text-gold' : 'text-off/85 hover:text-gold'
              }`}
            >
              Projects
              <span className="absolute -bottom-1.5 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>

            <button
              onClick={() => handleNavClick('#why-us')}
              className="text-off/85 text-sm font-medium tracking-wide hover:text-gold transition-colors relative group"
            >
              Why Us
              <span className="absolute -bottom-1.5 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
            </button>

            <button
              onClick={() => handleNavClick('#contact')}
              className="text-off/85 text-sm font-medium tracking-wide hover:text-gold transition-colors relative group"
            >
              Contact
              <span className="absolute -bottom-1.5 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
            </button>
          </nav>

          {/* Desktop Right CTA / Auth */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="inline-flex items-center gap-2 border border-off/20 text-off text-xs font-semibold px-3 py-2 hover:border-gold transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-gold" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="w-3 h-3 text-off/50" />
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-navy-dark border border-off/15 shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-off/10 text-xs text-off/60 truncate">
                      Signed in as<br />
                      <strong className="text-off">{user.email}</strong>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs eyebrow text-gold hover:bg-navy transition-colors font-semibold"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-left text-off/80 hover:text-red-400 hover:bg-navy transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-off/80 hover:text-gold text-xs eyebrow font-medium px-3 py-2 transition-colors"
              >
                Login
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 bg-gold/15 text-gold border border-gold/40 text-xs font-semibold eyebrow px-3.5 py-2 hover:bg-gold hover:text-navy-dark transition-all"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}

            <button
              onClick={() => handleNavClick('#contact')}
              className="inline-flex items-center gap-2 border border-gold text-gold text-xs font-semibold tracking-wide px-4 py-2 hover:bg-gold hover:text-navy-dark transition-colors duration-300"
            >
              Get Quote
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden flex flex-col justify-center items-end gap-1.5 w-10 h-10"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span className={`block h-px bg-off transition-all duration-300 ${open ? 'w-6 rotate-45 translate-y-[7px]' : 'w-6'}`} />
            <span className={`block h-px bg-off transition-all duration-300 ${open ? 'opacity-0 w-6' : 'w-4'}`} />
            <span className={`block h-px bg-off transition-all duration-300 ${open ? 'w-6 -rotate-45 -translate-y-[7px]' : 'w-6'}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-[max-height] duration-500 ease-in-out bg-navy-dark/98 backdrop-blur-md ${
          open ? 'max-h-[36rem]' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col px-6 py-6 gap-1">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="text-off/90 py-3 border-b border-off/10 text-sm tracking-wide"
          >
            Home
          </Link>

          <button
            onClick={() => handleNavClick('#about')}
            className="text-left text-off/90 py-3 border-b border-off/10 text-sm tracking-wide"
          >
            About
          </button>

          <button
            onClick={() => handleNavClick('#services')}
            className="text-left text-off/90 py-3 border-b border-off/10 text-sm tracking-wide"
          >
            Services
          </button>

          <Link
            to="/projects"
            onClick={() => setOpen(false)}
            className="text-off/90 py-3 border-b border-off/10 text-sm tracking-wide"
          >
            Projects
          </Link>

          <button
            onClick={() => handleNavClick('#why-us')}
            className="text-left text-off/90 py-3 border-b border-off/10 text-sm tracking-wide"
          >
            Why Us
          </button>

          <button
            onClick={() => handleNavClick('#contact')}
            className="text-left text-off/90 py-3 border-b border-off/10 text-sm tracking-wide"
          >
            Contact
          </button>

          {/* User / Admin Mobile Links */}
          {user ? (
            <div className="pt-4 border-t border-off/10 flex flex-col gap-2">
              <div className="text-xs text-off/60 pb-2">
                Logged in as <strong className="text-gold">{user.name}</strong>
              </div>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="text-center bg-gold text-navy-dark text-xs eyebrow font-bold py-3"
                >
                  Open Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-center border border-off/20 text-off/70 text-xs eyebrow py-2.5 hover:text-red-400"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-off/10 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="text-center border border-off/30 text-off text-sm py-2.5"
              >
                Account Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="text-center text-gold text-xs eyebrow py-2"
              >
                Create an Account →
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={() => handleNavClick('#contact')}
              className="text-center border border-gold text-gold text-sm font-semibold tracking-wide px-5 py-3"
            >
              Get a Free Quote
            </button>
            <a
              href={siteConfig.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center bg-gold text-navy-dark text-sm font-semibold tracking-wide px-5 py-3"
            >
              WhatsApp Us
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
