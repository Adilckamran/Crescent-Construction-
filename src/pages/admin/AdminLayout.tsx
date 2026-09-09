import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FolderKanban, 
  Mail, 
  Wrench, 
  Quote, 
  Users, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X,
  Building2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import logo from '../../assets/logo.png'
import { siteConfig } from '../../siteConfig'

export default function AdminLayout() {
  const { user, loading, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/login', { state: { from: location } })
    }
  }, [user, loading, isAdmin, navigate, location])

  // Fetch unread count for badge
  useEffect(() => {
    if (isAdmin) {
      api.getInquiries({ unread: true })
        .then(res => setUnreadCount(res.inquiries.length))
        .catch(() => {})
    }
  }, [isAdmin, location.pathname])

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-dark flex items-center justify-center text-off">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="eyebrow text-gold text-xs">Authenticating Administrator Session...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  const NAV_ITEMS = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
    { 
      label: 'Inquiries', 
      path: '/admin/inquiries', 
      icon: Mail, 
      badge: unreadCount > 0 ? unreadCount : undefined 
    },
    { label: 'Services', path: '/admin/services', icon: Wrench },
    { label: 'Testimonials', path: '/admin/testimonials', icon: Quote },
    { label: 'User Accounts', path: '/admin/users', icon: Users },
    { label: 'Login Activity', path: '/admin/activity', icon: ShieldCheck },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-charcoal text-off flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-navy-dark border-r border-off/10 shrink-0 select-none">
        {/* Brand */}
        <div className="p-6 border-b border-off/10 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-off p-1.5 ring-1 ring-gold/30 shrink-0 flex items-center justify-center">
            <img src={logo} alt="Crescent Logo" className="w-full h-full object-contain" />
          </span>
          <div className="truncate">
            <span className="font-display font-semibold text-off text-sm block truncate">
              {siteConfig.name}
            </span>
            <span className="eyebrow text-gold text-[9px] block">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 text-xs eyebrow transition-colors ${
                  active
                    ? 'bg-gold text-navy-dark font-semibold shadow-sm'
                    : 'text-off/70 hover:bg-navy hover:text-gold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    active ? 'bg-navy-dark text-gold' : 'bg-gold text-navy-dark'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-off/10 space-y-2">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-xs text-off/60 hover:text-gold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Site</span>
          </Link>

          <div className="px-3 py-2 bg-navy/60 border border-off/5 flex items-center justify-between">
            <div className="truncate text-xs">
              <span className="text-off/80 font-medium block truncate">{user.name}</span>
              <span className="eyebrow text-gold text-[9px]">Super Administrator</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-off/40 hover:text-red-400 p-1"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-navy-dark border-b border-off/10 px-4 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-off p-1 ring-1 ring-gold/30 shrink-0 flex items-center justify-center">
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </span>
          <span className="font-display font-semibold text-off text-sm">
            Admin Panel
          </span>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Link to="/admin/inquiries" className="bg-gold text-navy-dark text-[10px] eyebrow px-2 py-0.5 font-bold">
              {unreadCount} New
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-off hover:text-gold"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-navy-dark/98 z-50 p-6 flex flex-col justify-between overflow-y-auto">
          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 text-sm eyebrow border ${
                    active
                      ? 'bg-gold text-navy-dark border-gold font-bold'
                      : 'border-off/10 text-off/80 hover:border-gold hover:text-gold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-gold text-navy-dark px-2 py-0.5 text-xs font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="pt-6 border-t border-off/10 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 border border-off/20 py-3 text-xs eyebrow text-off"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Website
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-950/80 text-red-200 border border-red-500/30 py-3 text-xs eyebrow"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-57px)] md:min-h-screen p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
