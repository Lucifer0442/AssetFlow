import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { Role } from '@/types'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: Role[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#3D1F35' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse" style={{ background: '#7A3B5E' }}>
            <span className="text-white font-bold">AF</span>
          </div>
          <p className="text-sm" style={{ color: '#9C7A8A' }}>Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
