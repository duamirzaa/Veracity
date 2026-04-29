'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import * as authService from '@/services/auth'

export type UserRole = 'user' | 'project_manager' | 'admin' | 'student'
export type UserTier = 'free' | 'pro'

export interface User {
  id: number
  email: string
  username: string
  full_name: string | null
  role: UserRole
  tier: UserTier
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string, full_name?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
      const response = await authService.login({ email, password })
      setUser(response.user)
      setToken(response.token)
      Cookies.set('auth_token', response.token, { expires: 7 })
      Cookies.set('auth_user', JSON.stringify(response.user), { expires: 7 })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, username: string, password: string, full_name?: string) => {
    try {
      setLoading(true)
      const response = await authService.register({
        email,
        username,
        password,
        full_name,
      })
      // Note: Register does not return token - user must login after registration
      // Just show success message or redirect to login
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
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
