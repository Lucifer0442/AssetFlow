import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, Role } from '@/types'

// Demo users for role-based testing without a backend
const DEMO_USERS: Record<string, User & { password: string }> = {
  'admin@assetflow.in': { id: 'u1', name: 'Aryan Sharma', email: 'admin@assetflow.in', role: 'Admin', department: 'Engineering', password: 'demo123' },
  'manager@assetflow.in': { id: 'u2', name: 'Priya Mehta', email: 'manager@assetflow.in', role: 'AssetManager', department: 'Design', password: 'demo123' },
  'depthead@assetflow.in': { id: 'u3', name: 'Vikram Nair', email: 'depthead@assetflow.in', role: 'DeptHead', department: 'Operations', password: 'demo123' },
  'employee@assetflow.in': { id: 'u4', name: 'Sunita Rao', email: 'employee@assetflow.in', role: 'Employee', department: 'Finance', password: 'demo123' },
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  hasRole: (...roles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('assetflow_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { /* noop */ }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 800)) // Simulate API delay
    const found = DEMO_USERS[email.toLowerCase()]
    if (!found || found.password !== password) {
      throw new Error('Invalid email or password')
    }
    const { password: _, ...u } = found
    setUser(u)
    localStorage.setItem('assetflow_user', JSON.stringify(u))
  }

  const signup = async (name: string, email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 800))
    // In real app, call POST /api/auth/signup
    const newUser: User = { id: crypto.randomUUID(), name, email, role: 'Employee' }
    setUser(newUser)
    localStorage.setItem('assetflow_user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('assetflow_user')
  }

  const hasRole = (...roles: Role[]) => !!user && roles.includes(user.role)

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
