import React, { useState, useEffect } from 'react'
import { 
  Mail, 
  Search, 
  Check, 
  Trash2, 
  MessageSquare, 
  Phone, 
  ExternalLink, 
  Filter, 
  Clock, 
  MapPin, 
  DollarSign, 
  RefreshCw 
} from 'lucide-react'
import { api, ContactInquiry } from '../../services/api'
import { buildWhatsAppLink } from '../../siteConfig'

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [search, setSearch] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    loadInquiries()
  }, [])

  const loadInquiries = async () => {
    try {
      setLoading(true)
      const res = await api.getInquiries()
      setInquiries(res.inquiries)
    } catch (err) {
      console.error('Error loading inquiries:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRead = async (id: string, currentStatus: boolean) => {
    try {
      await api.toggleInquiryRead(id, !currentStatus)
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, is_read: !currentStatus } : i))
      )
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, is_read: !currentStatus })
      }
    } catch (err) {
      console.error('Error toggling read status:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteInquiry(id)
      setDeleteConfirmId(null)
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null)
      }
      loadInquiries()
    } catch (err) {
      alert('Failed to delete inquiry.')
    }
  }

  const filtered = inquiries.filter((i) => {
    const matchStatus =
      filter === 'all' ? true : filter === 'unread' ? !i.is_read : i.is_read
    const matchSearch =
      !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase()) ||
      i.phone.includes(search) ||
      i.message.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-off/10">
        <div>
          <span className="eyebrow text-gold text-xs">Customer Communication</span>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-off mt-1">
            Contact Inquiries
          </h1>
        </div>

        <button
          onClick={loadInquiries}
          className="inline-flex items-center gap-2 border border-off/20 text-off/80 hover:text-gold hover:border-gold px-3.5 py-2 text-xs eyebrow transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Inquiries
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-navy border border-off/10 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-off/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries by name, email, phone..."
            className="w-full bg-navy-dark border border-off/15 pl-10 pr-4 py-2 text-xs text-off placeholder:text-off/30 focus:outline-none focus:border-gold"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="eyebrow text-off/40 text-[10px]">Filter:</span>
          {(['all', 'unread', 'read'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 text-xs eyebrow border capitalize transition-colors ${
                filter === st
                  ? 'bg-gold text-navy-dark border-gold font-bold'
                  : 'border-off/15 text-off/60 hover:text-gold'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries Table */}
      {loading ? (
        <div className="text-center py-20 text-off/50">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="eyebrow text-gold text-xs">Loading Inquiries...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-navy border border-dashed border-off/15 p-8">
          <Mail className="w-10 h-10 text-off/20 mx-auto mb-3" />
          <p className="text-off/50 text-sm">No contact inquiries found.</p>
          <p className="text-xs text-off/30 mt-1">Inquiries submitted via the public contact form appear here automatically.</p>
        </div>
      ) : (
        <div className="bg-navy border border-off/10 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-dark/70 border-b border-off/10 text-off/50 eyebrow text-[10px]">
              <tr>
                <th className="p-4 w-8">Status</th>
                <th className="p-4">Sender</th>
                <th className="p-4">Project Type</th>
                <th className="p-4">Location</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-off/5">
              {filtered.map((inq) => {
                const whatsappHref = buildWhatsAppLink(
                  `Hello ${inq.name}, thank you for reaching out to Crescent Construction regarding your project.`
                )
                return (
                  <tr
                    key={inq.id}
                    className={`hover:bg-navy-dark/40 transition-colors ${
                      !inq.is_read ? 'bg-navy-dark/20 font-medium' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          inq.is_read ? 'bg-off/20' : 'bg-gold animate-pulse'
                        }`}
                        title={inq.is_read ? 'Read' : 'New / Unread'}
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="text-off block font-semibold">{inq.name}</span>
                        <span className="text-off/50 text-[11px] block">{inq.phone}</span>
                        <span className="text-off/40 text-[11px] block">{inq.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="eyebrow bg-navy-dark px-2 py-0.5 text-[10px] text-gold border border-off/10">
                        {inq.project_type || 'General'}
                      </span>
                    </td>
                    <td className="p-4 text-off/70 truncate max-w-[140px]">
                      {inq.location || '—'}
                    </td>
                    <td className="p-4 text-off/50 whitespace-nowrap text-[11px]">
                      {new Date(inq.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className="px-2.5 py-1 text-xs eyebrow border border-off/20 text-off/70 hover:border-gold hover:text-gold transition-colors"
                        >
                          View
                        </button>
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-gold/10 text-gold hover:bg-gold hover:text-navy-dark border border-gold/30 transition-colors"
                          title="WhatsApp reply"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleToggleRead(inq.id, inq.is_read)}
                          className={`p-1.5 border transition-colors ${
                            inq.is_read
                              ? 'border-off/20 text-off/30 hover:text-gold'
                              : 'border-gold text-gold bg-gold/10 hover:bg-gold hover:text-navy-dark'
                          }`}
                          title={inq.is_read ? 'Mark Unread' : 'Mark Read'}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(inq.id)}
                          className="p-1.5 text-off/30 hover:text-red-400"
                          title="Delete inquiry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Inquiry View Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
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
                  <span className="text-off font-medium">{selectedInquiry.project_type || 'General'}</span>
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
                <span className="text-off/40 block eyebrow text-[10px] mb-1">Inquiry Message</span>
                <div className="bg-navy-dark p-3 border border-off/5 text-off/80 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
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
              <a
                href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                  `Re: Crescent Construction Inquiry - ${selectedInquiry.project_type || 'Construction Project'}`
                )}`}
                className="border border-off/20 text-off text-xs eyebrow px-4 py-2 hover:border-gold hover:text-gold transition-colors inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                Reply via Email
              </a>
              <button
                onClick={() => handleToggleRead(selectedInquiry.id, selectedInquiry.is_read)}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-navy border border-red-500/30 max-w-sm w-full p-6 text-center shadow-2xl">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h4 className="font-display text-lg text-off font-semibold">Delete Inquiry?</h4>
            <p className="text-off/60 text-xs mt-2 leading-relaxed">
              This inquiry record will be permanently deleted from the database.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs eyebrow border border-off/20 text-off/70 hover:text-off"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs eyebrow bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
