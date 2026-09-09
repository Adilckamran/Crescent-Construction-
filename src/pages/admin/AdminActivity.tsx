import React, { useState, useEffect } from 'react'
import { ShieldCheck, Search, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import { api, LoginActivity } from '../../services/api'

export default function AdminActivity() {
  const [activity, setActivity] = useState<LoginActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const res = await api.getLoginActivity(200)
      setActivity(res.activity)
    } catch (err) {
      console.error('Error fetching activity logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = activity.filter(a =>
    !search ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.ip_address.includes(search) ||
    a.user_agent.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-off/10">
        <div>
          <span className="eyebrow text-gold text-xs">Security & Compliance</span>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-off mt-1">
            Login Activity Audit
          </h1>
        </div>

        <button
          onClick={loadLogs}
          className="inline-flex items-center gap-2 border border-off/20 text-off/80 hover:text-gold hover:border-gold px-3.5 py-2 text-xs eyebrow transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Logs
        </button>
      </div>

      <div className="bg-navy border border-off/10 p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-off/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, IP or device..."
            className="w-full bg-navy-dark border border-off/15 pl-10 pr-4 py-2 text-xs text-off placeholder:text-off/30 focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-off/50">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="eyebrow text-gold text-xs">Loading Security Audit Logs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-navy border border-dashed border-off/15 p-8">
          <p className="text-off/50 text-sm">No login activity records found.</p>
        </div>
      ) : (
        <div className="bg-navy border border-off/10 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-dark/70 border-b border-off/10 text-off/50 eyebrow text-[10px]">
              <tr>
                <th className="p-4 w-8">Status</th>
                <th className="p-4">Account Email</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">User Agent / Client</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-off/5 font-mono text-[11px]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-navy-dark/40 transition-colors">
                  <td className="p-4">
                    {log.status === 'success' ? (
                      <span className="inline-flex items-center text-green-400" title="Successful Login">
                        <CheckCircle className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-400" title="Failed Login Attempt">
                        <AlertCircle className="w-4 h-4" />
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-sans text-xs font-medium text-off">{log.email}</td>
                  <td className="p-4 text-off/70">{log.ip_address}</td>
                  <td className="p-4 text-off/50 truncate max-w-xs" title={log.user_agent}>
                    {log.user_agent}
                  </td>
                  <td className="p-4 text-right text-off/60 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
