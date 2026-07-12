import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, Role } from '@/types'
import { apiClient } from '@/lib/apiClient'
import { toFrontendRole } from '@/lib/apiService'
import { connectSocket, disconnectSocket } from '@/lib/socketClient'

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

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('assetflow_access_token')
    localStorage.removeItem('assetflow_refresh_token')
    localStorage.removeItem('assetflow_user')
    disconnectSocket()
  }

  useEffect(() => {
    const stored = localStorage.getItem('assetflow_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
        connectSocket()
      } catch {
        handleLogout()
      }
    }
    setIsLoading(false)

    // Listen to global auto-logout events from Axios interceptors
    const onAuthLogout = () => handleLogout()
    window.addEventListener('auth_logout', onAuthLogout)
    return () => window.removeEventListener('auth_logout', onAuthLogout)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password })
    const { user: backendUser, accessToken, refreshToken } = res.data.data

    localStorage.setItem('assetflow_access_token', accessToken)
    localStorage.setItem('assetflow_refresh_token', refreshToken)

    // Map backend roles (lowercase) to frontend Role (cased)
    const backendRole = backendUser.roles?.[0] || 'employee'
    const mappedRole = toFrontendRole(backendRole)

    const mappedUser: User = {
      id: backendUser.id,
      name: `${backendUser.firstName} ${backendUser.lastName}`.trim() || backendUser.email,
      email: backendUser.email,
      role: mappedRole,
      department: undefined, // derived dynamically or updated on profile load
      avatarUrl: undefined,
    }

    setUser(mappedUser)
    localStorage.setItem('assetflow_user', JSON.stringify(mappedUser))
    connectSocket()
  }

  const signup = async (name: string, email: string, password: string) => {
    // Split name into first and last name
    const parts = name.trim().split(' ')
    const firstName = parts[0] || 'Employee'
    const lastName = parts.slice(1).join(' ') || 'User'
    const employeeCode = `EMP-${Math.floor(1000 + Math.random() * 9000)}`

    // Hit backend registration
    await apiClient.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      employeeCode,
    })

    // Perform auto login
    await login(email, password)
  }

  const logout = () => {
    const rToken = localStorage.getItem('assetflow_refresh_token')
    if (rToken) {
      apiClient.post('/auth/logout', { refreshToken: rToken }).catch(() => { /* noop */ })
    }
    handleLogout()
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
