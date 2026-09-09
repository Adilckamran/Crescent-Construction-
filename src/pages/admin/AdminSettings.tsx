import React, { useState } from 'react'
import { KeyRound, Shield, Check, AlertCircle, Server, Mail, HardDrive } from 'lucide-react'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { siteConfig } from '../../siteConfig'

export default function AdminSettings() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    try {
      setLoading(true)
      const res = await api.changePassword(currentPassword, newPassword)
      setMessage(res.message || 'Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err?.message || 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-6 border-b border-off/10">
        <span className="eyebrow text-gold text-xs">Configuration</span>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-off mt-1">
          Admin Settings & Security
        </h1>
      </div>

      {/* Change Password Card */}
      <div className="bg-navy border border-off/10 p-6 sm:p-8 corner-ticks">
        <div className="flex items-center gap-3 mb-4">
          <KeyRound className="w-5 h-5 text-gold" />
          <h2 className="font-display text-lg text-off font-semibold">Change Admin Password</h2>
        </div>
        <p className="text-off/60 text-xs mb-6 max-w-md">
          Update the credentials used to access the administrator panel. Store your updated password safely.
        </p>

        {message && (
          <div className="mb-6 bg-green-950/60 border border-green-500/40 p-4 text-xs text-green-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-950/60 border border-red-500/40 p-4 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="eyebrow text-off/50 text-[10px] block mb-1.5">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-navy-dark border border-off/20 p-2.5 text-off focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="eyebrow text-off/50 text-[10px] block mb-1.5">
              New Password *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-navy-dark border border-off/20 p-2.5 text-off focus:border-gold outline-none"
            />
          </div>

          <div>
            <label className="eyebrow text-off/50 text-[10px] block mb-1.5">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full bg-navy-dark border border-off/20 p-2.5 text-off focus:border-gold outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-6 py-2.5 bg-gold text-navy-dark font-semibold text-xs eyebrow hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* System Diagnostics Card */}
      <div className="bg-navy border border-off/10 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <Server className="w-5 h-5 text-gold" />
          <h2 className="font-display text-lg text-off font-semibold">System Architecture & Deployment Status</h2>
        </div>
        <div className="hairline w-16 mb-6" />

        <div className="grid sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-navy-dark p-4 border border-off/10">
            <div className="flex items-center gap-2 text-off/50 mb-2">
              <Mail className="w-4 h-4 text-gold" />
              <span className="eyebrow text-[10px]">Email Dispatch</span>
            </div>
            <p className="font-medium text-off">{siteConfig.email}</p>
            <p className="text-[11px] text-off/40 mt-1">Configured via SMTP in .env</p>
          </div>

          <div className="bg-navy-dark p-4 border border-off/10">
            <div className="flex items-center gap-2 text-off/50 mb-2">
              <HardDrive className="w-4 h-4 text-gold" />
              <span className="eyebrow text-[10px]">Database Persistence</span>
            </div>
            <p className="font-medium text-green-400">Atomic Store Active</p>
            <p className="text-[11px] text-off/40 mt-1">crescent_db.json (ACID safe)</p>
          </div>

          <div className="bg-navy-dark p-4 border border-off/10">
            <div className="flex items-center gap-2 text-off/50 mb-2">
              <Shield className="w-4 h-4 text-gold" />
              <span className="eyebrow text-[10px]">Role Authorization</span>
            </div>
            <p className="font-medium text-gold">RBAC Active</p>
            <p className="text-[11px] text-off/40 mt-1">Admin + User permissions</p>
          </div>
        </div>
      </div>
    </div>
  )
}
