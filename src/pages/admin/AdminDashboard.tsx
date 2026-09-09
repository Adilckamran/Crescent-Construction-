import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FolderKanban, 
  Mail, 
  Users, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  Check, 
  MessageSquare, 
  Phone, 
  Clock, 
  Plus,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { api, AdminStats, ContactInquiry } from '../../services/api'
import { buildWhatsAppLink } from '../../siteConfig'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await api.getStats()
      setStats(data)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching admin stats:', err)
      setError('Failed to load dashboard metrics.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRead = async (inquiry: ContactInquiry) => {
    try {
      await api.toggleInquiryRead(inquiry.id, !inquiry.is_read)
      loadStats()
      if (selectedInquiry?.id === inquiry.id) {
        setSelectedInquiry({ ...selectedInquiry, is_read: !inquiry.is_read })
      }
    } catch (err) {
      console.error('Error updating inquiry status:', err)
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="eyebrow text-gold text-xs">Loading Dashboard Metrics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-off/10">
        <div>
          <span className="eyebrow text-gold text-xs">Management Console</span>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-off mt-1">
            Website Overview & Analytics
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadStats}
            className="inline-flex items-center gap-2 border border-off/20 text-off/80 hover:text-gold hover:border-gold px-3.5 py-2 text-xs eyebrow transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-2 bg-gold text-navy-dark font-semibold px-4 py-2 text-xs eyebrow hover:bg-gold-light transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Project
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/60 border border-red-500/40 p-4 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-navy border border-off/10 p-5 corner-ticks">
            <div className="flex items-center justify-between text-off/50 mb-3">
              <span className="eyebrow text-[10px]">Total Inquiries</span>
              <Mail className="w-4 h-4 text-gold" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl sm:text-3xl font-bold text-off">{stats.totalInquiries}</span>
              {stats.unreadInquiries > 0 && (
                <span className="eyebrow bg-gold text-navy-dark text-[10px] font-bold px-2 py-0.5">
                  {stats.unreadInquiries} unread
                </span>
              )}
            </div>
            <p className="text-off/40 text-[11px] mt-2">Client project requests</p>
          </div>

          <div className="bg-navy border border-off/10 p-5 corner-ticks">
            <div className="flex items-center justify-between text-off/50 mb-3">
              <span className="eyebrow text-[10px]">Live Projects</span>
              <FolderKanban className="w-4 h-4 text-gold" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl sm:text-3xl font-bold text-off">{stats.totalProjects}</span>
              <span className="eyebrow text-gold text-[10px]">
                {stats.featuredProjects} featured
              </span>
            </div>
            <p className="text-off/40 text-[11px] mt-2">Portfolio showcase works</p>
          </div>

          <div className="bg-navy border border-off/10 p-5 corner-ticks">
            <div className="flex items-center justify-between text-off/50 mb-3">
              <span className="eyebrow text-[10px]">Registered Users</span>
              <Users className="w-4 h-4 text-gold" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl sm:text-3xl font-bold text-off">{stats.totalUsers}</span>
              <span className="eyebrow text-off/50 text-[10px]">Accounts</span>
            </div>
            <p className="text-off/40 text-[11px] mt-2">Admin & client user profiles</p>
          </div>

          <div className="bg-navy border border-off/10 p-5 corner-ticks">
            <div className="flex items-center justify-between text-off/50 mb-3">
              <span className="eyebrow text-[10px]">Login Activity</span>
              <ShieldCheck className="w-4 h-4 text-gold" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl sm:text-3xl font-bold text-off">{stats.totalLogins}</span>
              <span className="eyebrow text-green-400 text-[10px]">Audited</span>
            </div>
            <p className="text-off/40 text-[11px] mt-2">Security sessions logged</p>
          </div>
        </div>
      )}

      {/* Main Grid: Recent Inquiries & Activity */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Recent Inquiries (8 cols) */}
        <div className="lg:col-span-8 bg-navy border border-off/10 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-off/10">
            <div>
              <span className="eyebrow text-gold text-xs">Lead Generation</span>
              <h2 className="font-display text-lg text-off font-semibold mt-1">
                Recent Project Inquiries
              </h2>
            </div>
            <Link
              to="/admin/inquiries"
              className="inline-flex items-center gap-1 text-xs eyebrow text-gold hover:underline"
            >
              View All Inquiries
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!stats || stats.recentInquiries.length === 0 ? (
            <div className="text-center py-12 text-off/50 text-sm">
              <Mail className="w-10 h-10 text-off/20 mx-auto mb-3" />
              <p>No contact inquiries yet.</p>
              <p className="text-xs text-off/30 mt-1">Inquiries submitted from the contact form will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-off/10 mt-2">
              {stats.recentInquiries.map((inq) => {
                const whatsappHref = buildWhatsAppLink(
                  `Hello ${inq.name}, thank you for reaching out to Crescent Construction regarding your ${inq.project_type || 'project'}.`
                )
                return (
                  <div key={inq.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${inq.is_read ? 'bg-off/20' : 'bg-gold animate-pulse'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-off text-sm">{inq.name}</span>
                          <span className="eyebrow text-gold/80 text-[10px] bg-navy-dark px-2 py-0.5 border border-off/10">
                            {inq.project_type || 'General'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-off/50 mt-1">
                          <span>{inq.phone}</span>
                          <span>•</span>
                          <span>{new Date(inq.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-off/70 mt-1.5 line-clamp-1 italic">
                          "{inq.message}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => setSelectedInquiry(inq)}
                        className="text-xs eyebrow border border-off/20 text-off/70 hover:border-gold hover:text-gold px-3 py-1.5 transition-colors"
                      >
                        Details
                      </button>
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-gold/10 text-gold hover:bg-gold hover:text-navy-dark border border-gold/30 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleToggleRead(inq)}
                        className={`p-1.5 border transition-colors ${
                          inq.is_read 
                            ? 'border-off/20 text-off/40 hover:text-gold' 
                            : 'border-gold text-gold bg-gold/10 hover:bg-gold hover:text-navy-dark'
                        }`}
                        title={inq.is_read ? 'Mark as Unread' : 'Mark as Read'}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Security & Login Audit (4 cols) */}
        <div className="lg:col-span-4 bg-navy border border-off/10 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-off/10">
              <div>
                <span className="eyebrow text-gold text-xs">Security Log</span>
                <h2 className="font-display text-lg text-off font-semibold mt-1">
                  Recent Logins
                </h2>
              </div>
              <Link to="/admin/activity" className="text-xs eyebrow text-gold hover:underline">
                All Logs
              </Link>
            </div>

            {!stats || stats.recentLogins.length === 0 ? (
              <p className="text-off/40 text-xs py-8 text-center">No login activity recorded yet.</p>
            ) : (
              <div className="space-y-3 mt-4">
                {stats.recentLogins.map((act) => (
                  <div key={act.id} className="p-3 bg-navy-dark/60 border border-off/5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-off truncate max-w-[140px]">{act.email}</span>
                      <span className={`eyebrow text-[9px] px-1.5 py-0.5 ${
                        act.status === 'success' ? 'text-green-400 bg-green-950/40' : 'text-red-400 bg-red-950/40'
                      }`}>
                        {act.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-off/40 mt-1.5">
                      <span>{act.ip_address}</span>
                      <span>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-off/10">
            <Link
              to="/admin/settings"
              className="block text-center border border-gold/40 text-gold text-xs eyebrow py-2.5 hover:bg-gold hover:text-navy-dark transition-colors"
            >
              Security & Credentials Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-navy border border-off/20 max-w-lg w-full p-6 sm:p-8 corner-ticks relative shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-off/10">
              <div>
                <span className="eyebrow text-gold text-xs">Inquiry Details</span>
                <h3 className="font-display text-xl text-off font-semibold mt-1">
                  {selectedInquiry.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-off/60 hover:text-off text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-navy-dark p-3 border border-off/5">
                <div>
                  <span className="text-off/40 block eyebrow text-[10px]">Phone</span>
                  <a href={`tel:${selectedInquiry.phone}`} className="text-gold font-medium hover:underline">
                    {selectedInquiry.phone}
                  </a>
                </div>
                <div>
                  <span className="text-off/40 block eyebrow text-[10px]">Email</span>
                  <a href={`mailto:${selectedInquiry.email}`} className="text-off/90 hover:underline truncate block">
                    {selectedInquiry.email}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-navy-dark p-3 border border-off/5">
                <div>
                  <span className="text-off/40 block eyebrow text-[10px]">Project Type</span>
                  <span className="text-off font-medium">{selectedInquiry.project_type || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-off/40 block eyebrow text-[10px]">Location</span>
                  <span className="text-off font-medium">{selectedInquiry.location || 'Karachi'}</span>
                </div>
              </div>

              {selectedInquiry.budget && (
                <div className="bg-navy-dark p-3 border border-off/5">
                  <span className="text-off/40 block eyebrow text-[10px]">Estimated Budget</span>
                  <span className="text-off font-medium">{selectedInquiry.budget}</span>
                </div>
              )}

              <div>
                <span className="text-off/40 block eyebrow text-[10px] mb-1">Message</span>
                <div className="bg-navy-dark p-3 border border-off/5 text-off/80 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="text-[11px] text-off/40 pt-1">
                Submitted on: {new Date(selectedInquiry.created_at).toLocaleString()}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-off/10 flex flex-wrap gap-2 justify-end">
              <a
                href={buildWhatsAppLink(
                  `Hello ${selectedInquiry.name}, thank you for contacting Crescent Construction.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gold text-navy-dark font-semibold text-xs eyebrow px-4 py-2 hover:bg-gold-light transition-colors inline-flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Reply on WhatsApp
              </a>
              <button
                onClick={() => handleToggleRead(selectedInquiry)}
                className="border border-off/20 text-off text-xs eyebrow px-4 py-2 hover:border-gold hover:text-gold transition-colors"
              >
                {selectedInquiry.is_read ? 'Mark Unread' : 'Mark Read'}
              </button>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="border border-off/20 text-off/60 text-xs eyebrow px-4 py-2 hover:text-off"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
