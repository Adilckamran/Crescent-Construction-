import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api, User } from '../services/api'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  isAdmin: boolean
  login: (email: string, pass: string) => Promise<User>
  register: (name: string, email: string, pass: string) => Promise<User>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('crescent_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('crescent_token')
      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const { user: currentUser } = await api.getMe()
        setUser(currentUser)
      } catch (err) {
        console.warn('Session expired or invalid:', err)
        localStorage.removeItem('crescent_token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await api.login(email, pass)
    localStorage.setItem('crescent_token', res.token)
    setToken(res.token)
    setUser(res.user)
    return res.user
  }

  const register = async (name: string, email: string, pass: string): Promise<User> => {
    const res = await api.register(name, email, pass)
    localStorage.setItem('crescent_token', res.token)
    setToken(res.token)
    setUser(res.user)
    return res.user
  }

  const logout = () => {
    localStorage.removeItem('crescent_token')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const { user: updated } = await api.getMe()
      setUser(updated)
    } catch {
      logout()
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
