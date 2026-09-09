import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react'
import { api, ServiceItem } from '../../services/api'

export default function AdminServices() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<ServiceItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Form
  const [number, setNumber] = useState('')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [iconName, setIconName] = useState('Building2')
  const [cta, setCta] = useState('')
  const [sortOrder, setSortOrder] = useState(1)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      const res = await api.getServices()
      setServices(res.services)
    } catch (err) {
      console.error('Error fetching services:', err)
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setNumber(`0${services.length + 1}`)
    setTitle('')
    setDesc('')
    setIconName('Building2')
    setCta('Learn More')
    setSortOrder(services.length + 1)
    setIsModalOpen(true)
  }

  const openEdit = (s: ServiceItem) => {
    setEditing(s)
    setNumber(s.number)
    setTitle(s.title)
    setDesc(s.desc)
    setIconName(s.icon_name)
    setCta(s.cta || 'Learn More')
    setSortOrder(s.sort_order)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        number,
        title,
        desc,
        icon_name: iconName,
        cta,
        sort_order: Number(sortOrder),
      }

      if (editing) {
        await api.updateService(editing.id, payload)
      } else {
        await api.createService(payload)
      }

      setIsModalOpen(false)
      loadServices()
    } catch (err) {
      alert('Failed to save service.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteService(id)
      setDeleteId(null)
      loadServices()
    } catch {
      alert('Failed to delete service.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-off/10">
        <div>
          <span className="eyebrow text-gold text-xs">Content Management</span>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-off mt-1">
            Construction Services
          </h1>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-gold text-navy-dark font-semibold px-4 py-2 text-xs eyebrow hover:bg-gold-light transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-off/50">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="eyebrow text-gold text-xs">Loading Services...</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.id} className="bg-navy border border-off/10 p-6 flex flex-col justify-between corner-ticks">
              <div>
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-gold text-xs font-mono">{s.number}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(s)}
                      className="p-1.5 text-off/50 hover:text-gold"
                      title="Edit Service"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(s.id)}
                      className="p-1.5 text-off/30 hover:text-red-400"
                      title="Delete Service"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-display text-lg text-off font-semibold mt-3">{s.title}</h3>
                <p className="text-off/60 text-xs mt-2 leading-relaxed">{s.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-off/10 flex items-center justify-between text-[11px] text-off/40 eyebrow">
                <span>Order: #{s.sort_order}</span>
                <span className="text-gold">{s.cta || 'Learn More'}</span>
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
                {editing ? 'Edit Service' : 'Add Service'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-off/60 hover:text-off">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="eyebrow text-off/50 text-[10px] block mb-1">Number</label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full bg-navy-dark border border-off/20 p-2 text-off outline-none focus:border-gold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="eyebrow text-off/50 text-[10px] block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full bg-navy-dark border border-off/20 p-2 text-off outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="eyebrow text-off/50 text-[10px] block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grey Structure"
                  className="w-full bg-navy-dark border border-off/20 p-2 text-off outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="eyebrow text-off/50 text-[10px] block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-navy-dark border border-off/20 p-2 text-off outline-none focus:border-gold resize-none"
                />
              </div>

              <div>
                <label className="eyebrow text-off/50 text-[10px] block mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="Learn More"
                  className="w-full bg-navy-dark border border-off/20 p-2 text-off outline-none focus:border-gold"
                />
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
                  Save Service
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
            <h4 className="font-display text-lg text-off">Delete Service?</h4>
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
