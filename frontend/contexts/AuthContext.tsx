'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import * as authService from '@/services/auth'

export type UserRole = 'user' | 'project_manager' | 'admin' | 'student'
export type UserTier = 'free' | 'pro'

export interface User {
  id: number
  email: string
  full_name: string | null
  role: UserRole
  tier: UserTier
  is_active: boolean
  is_email_verified: boolean
  last_login_at: string | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, full_name?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for stored auth on mount
    const storedToken = Cookies.get('auth_token')
    const storedUser = Cookies.get('auth_user')
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        Cookies.remove('auth_token')
        Cookies.remove('auth_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authService.login({ email, password })
      setUser(response.user)
      setToken(response.token)
      Cookies.set('auth_token', response.token, { expires: 7 })
      Cookies.set('auth_user', JSON.stringify(response.user), { expires: 7 })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, full_name?: string) => {
    try {
      setLoading(true)
      setError(null)
      await authService.register({
        email,
        password,
        full_name,
      })
      // Registration successful - user must login after
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setError(null)
    Cookies.remove('auth_token')
    Cookies.remove('auth_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
