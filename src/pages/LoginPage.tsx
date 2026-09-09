import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'
import { siteConfig } from '../siteConfig'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, user } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if already logged in
  if (user) {
    if (user.role === 'admin') {
      navigate('/admin')
    } else {
      navigate('/')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    try {
      setLoading(true)
      const loggedInUser = await login(email, password)
      if (loggedInUser.role === 'admin') {
        navigate('/admin')
      } else {
        const from = (location.state as any)?.from?.pathname || '/'
        navigate(from)
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blueprint grid */}
      <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none" />

      <div className="relative w-full max-w-md bg-navy border border-off/15 p-8 sm:p-10 shadow-2xl corner-ticks">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-off ring-1 ring-gold/30 p-2 mb-4">
            <img src={logo} alt="Crescent Construction" className="w-full h-full object-contain" />
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl text-off font-semibold">
            Account Login
          </h1>
          <p className="eyebrow text-gold text-xs mt-2">
            {siteConfig.name} Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-950/60 border border-red-500/40 p-4 flex items-start gap-3 text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="eyebrow text-off/60 text-[11px] block mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-off/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-navy-dark border border-off/20 pl-10 pr-4 py-3 text-sm text-off placeholder:text-off/30 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="eyebrow text-off/60 text-[11px] block">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-off/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-navy-dark border border-off/20 pl-10 pr-11 py-3 text-sm text-off placeholder:text-off/30 focus:outline-none focus:border-gold transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-off/40 hover:text-gold transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gold text-navy-dark font-semibold text-xs eyebrow py-3.5 hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-navy-dark border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-off/10 text-center text-xs text-off/60">
          Don't have an account?{' '}
          <Link to="/signup" className="text-gold font-medium hover:underline">
            Register here
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-off/40 hover:text-off/70 transition-colors">
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
