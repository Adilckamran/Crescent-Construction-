import React, { useState, useEffect } from 'react'
import { Users, Shield, UserCheck, UserX, Trash2, RefreshCw } from 'lucide-react'
import { api, User } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await api.getUsers()
      setUsers(res.users)
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('You cannot deactivate your own account.')
      return
    }

    const nextStatus = user.status === 'active' ? 'inactive' : 'active'
    try {
      await api.updateUser(user.id, { status: nextStatus })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u))
    } catch (err: any) {
      alert(err?.message || 'Failed to update user status.')
    }
  }

  const handleToggleRole = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('You cannot change your own administrative role.')
      return
    }

    const nextRole = user.role === 'admin' ? 'user' : 'admin'
    const confirmMsg = `Are you sure you want to change ${user.name}'s role to ${nextRole.toUpperCase()}?`
    if (!window.confirm(confirmMsg)) return

    try {
      await api.updateUser(user.id, { role: nextRole })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: nextRole } : u))
    } catch (err: any) {
      alert(err?.message || 'Failed to change user role.')
    }
  }

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      alert('You cannot delete your own account.')
      return
    }

    try {
      await api.deleteUser(id)
      setDeleteConfirmId(null)
      loadUsers()
    } catch (err: any) {
      alert(err?.message || 'Failed to delete user.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-off/10">
        <div>
          <span className="eyebrow text-gold text-xs">Access Control</span>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-off mt-1">
            Registered Users
          </h1>
        </div>

        <button
          onClick={loadUsers}
          className="inline-flex items-center gap-2 border border-off/20 text-off/80 hover:text-gold hover:border-gold px-3.5 py-2 text-xs eyebrow transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Users
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-off/50">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="eyebrow text-gold text-xs">Loading User Directory...</p>
        </div>
      ) : (
        <div className="bg-navy border border-off/10 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-dark/70 border-b border-off/10 text-off/50 eyebrow text-[10px]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-off/5">
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id
                return (
                  <tr key={u.id} className="hover:bg-navy-dark/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-navy-dark border border-off/15 flex items-center justify-center font-display font-bold text-gold text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-off block">{u.name}</span>
                          {isSelf && (
                            <span className="eyebrow text-gold text-[9px] block">Current Session</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-off/80">{u.email}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleRole(u)}
                        disabled={isSelf}
                        className={`eyebrow text-[10px] px-2.5 py-1 border transition-colors ${
                          u.role === 'admin'
                            ? 'bg-gold text-navy-dark border-gold font-bold'
                            : 'bg-navy-dark text-off/70 border-off/15 hover:border-gold'
                        } ${isSelf ? 'cursor-default' : 'cursor-pointer'}`}
                        title={isSelf ? 'Cannot change own role' : 'Click to toggle Admin / User role'}
                      >
                        {u.role.toUpperCase()}
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={isSelf}
                        className={`eyebrow text-[10px] px-2 py-0.5 border ${
                          u.status === 'active'
                            ? 'text-green-400 border-green-500/30 bg-green-950/20'
                            : 'text-red-400 border-red-500/30 bg-red-950/20'
                        } ${isSelf ? 'cursor-default' : 'cursor-pointer'}`}
                        title={isSelf ? 'Cannot change own status' : 'Click to toggle Active / Inactive'}
                      >
                        {u.status}
                      </button>
                    </td>
                    <td className="p-4 text-off/50 whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-off/50 whitespace-nowrap">
                      {u.last_login_at
                        ? new Date(u.last_login_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Never'}
                    </td>
                    <td className="p-4 text-right">
                      {!isSelf && (
                        <button
                          onClick={() => setDeleteConfirmId(u.id)}
                          className="p-1.5 text-off/40 hover:text-red-400 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-navy border border-red-500/30 max-w-sm w-full p-6 text-center shadow-2xl">
            <h4 className="font-display text-lg text-off font-semibold">Delete User Account?</h4>
            <p className="text-off/60 text-xs mt-2">
              This user will no longer be able to log in to the portal.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-1.5 text-xs eyebrow border border-off/20 text-off/70"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-1.5 text-xs eyebrow bg-red-600 text-white font-semibold"
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
