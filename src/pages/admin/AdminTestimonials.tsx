import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Star } from 'lucide-react'
import { api, TestimonialItem } from '../../services/api'

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<TestimonialItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Form
  const [label, setLabel] = useState('')
  const [type, setType] = useState('')
  const [location, setLocation] = useState('')
  const [quote, setQuote] = useState('')
  const [isSample, setIsSample] = useState(false)
  const [rating, setRating] = useState(5)

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = async () => {
    try {
      setLoading(true)
      const res = await api.getTestimonials()
      setTestimonials(res.testimonials)
    } catch (err) {
      console.error('Error fetching testimonials:', err)
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setLabel('')
    setType('Residential Construction Client')
    setLocation('Karachi')
    setQuote('')
    setIsSample(false)
    setRating(5)
    setIsModalOpen(true)
  }

  const openEdit = (t: TestimonialItem) => {
    setEditing(t)
    setLabel(t.label)
    setType(t.type)
    setLocation(t.location)
    setQuote(t.quote)
    setIsSample(t.is_sample)
    setRating(t.rating || 5)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        label,
        type,
        location,
        quote,
        is_sample: isSample,
        rating: Number(rating),
      }

      if (editing) {
        await api.updateTestimonial(editing.id, payload)
      } else {
        await api.createTestimonial(payload)
      }

      setIsModalOpen(false)
      loadTestimonials()
    } catch {
      alert('Failed to save testimonial.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTestimonial(id)
      setDeleteId(null)
      loadTestimonials()
    } catch {
      alert('Failed to delete testimonial.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-off/10">
        <div>
          <span className="eyebrow text-gold text-xs">Social Proof</span>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-off mt-1">
            Testimonials & Reviews
          </h1>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-gold text-navy-dark font-semibold px-4 py-2 text-xs eyebrow hover:bg-gold-light transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Review
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-off/50">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="eyebrow text-gold text-xs">Loading Testimonials...</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-navy border border-off/10 p-6 flex flex-col justify-between corner-ticks relative">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex text-gold">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-gold" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEdit(t)} className="p-1.5 text-off/50 hover:text-gold">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteId(t.id)} className="p-1.5 text-off/30 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-off/80 text-xs italic mt-4 leading-relaxed line-clamp-4">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-off/10">
                <p className="font-display text-off font-semibold text-sm">{t.label}</p>
                <p className="eyebrow text-off/40 text-[10px] mt-0.5">
                  {t.type} — {t.location}
                </p>
                {t.is_sample && (
                  <span className="inline-block mt-2 eyebrow text-[9px] text-gold/60 border border-gold/20 px-1.5 py-0.5">
                    Sample Draft
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-navy border border-off/20 max-w-md w-full p-6 corner-ticks shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-off/10">
              <h3 className="font-display text-lg text-off font-semibold">
                {editing ? 'Edit Testimonial' : 'Add Testimonial'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-off/60 hover:text-off">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="eyebrow text-off/50 text-[10px] block mb-1">Client / Project Label</label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. DHA Villa Owner"
                  className="w-full bg-navy-dark border border-off/20 p-2 text-off outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="eyebrow text-off/50 text-[10px] block mb-1">Client Type</label>
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="Residential Client"
                    className="w-full bg-navy-dark border border-off/20 p-2 text-off outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="eyebrow text-off/50 text-[10px] block mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Karachi"
                    className="w-full bg-navy-dark border border-off/20 p-2 text-off outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="eyebrow text-off/50 text-[10px] block mb-1">Client Feedback Quote</label>
                <textarea
                  rows={4}
                  required
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full bg-navy-dark border border-off/20 p-2 text-off outline-none focus:border-gold resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sampleCheck"
                  checked={isSample}
                  onChange={(e) => setIsSample(e.target.checked)}
                  className="accent-gold w-4 h-4"
                />
                <label htmlFor="sampleCheck" className="text-off/70 cursor-pointer">
                  Mark as sample review (not yet verified)
                </label>
              </div>

              <div className="pt-3 border-t border-off/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs eyebrow border border-off/20 text-off/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs eyebrow bg-gold text-navy-dark font-semibold hover:bg-gold-light"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-navy border border-red-500/30 max-w-sm w-full p-6 text-center">
            <h4 className="font-display text-lg text-off">Delete Testimonial?</h4>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-1.5 text-xs eyebrow border border-off/20 text-off/70"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-1.5 text-xs eyebrow bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
