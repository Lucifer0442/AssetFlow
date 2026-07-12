import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { AppLayout } from '@/layouts/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { OrgSetupPage } from '@/pages/OrgSetupPage'
import { AssetsPage } from '@/pages/AssetsPage'
import { AllocationsPage } from '@/pages/AllocationsPage'
import { BookingsPage } from '@/pages/BookingsPage'
import { MaintenancePage } from '@/pages/MaintenancePage'
import { AuditsPage } from '@/pages/AuditsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { NotificationsPage } from '@/pages/NotificationsPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected App Shell */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="org" element={
                <ProtectedRoute roles={['Admin']}>
                  <OrgSetupPage />
                </ProtectedRoute>
              } />
              <Route path="assets" element={<AssetsPage />} />
              <Route path="allocations" element={<AllocationsPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="maintenance" element={<MaintenancePage />} />
              <Route path="audits" element={
                <ProtectedRoute roles={['Admin', 'AssetManager']}>
                  <AuditsPage />
                </ProtectedRoute>
              } />
              <Route path="reports" element={
                <ProtectedRoute roles={['Admin', 'AssetManager', 'DeptHead']}>
                  <ReportsPage />
                </ProtectedRoute>
              } />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-slate-400">
                    <p className="text-lg font-medium">Settings</p>
                    <p className="text-sm mt-1">Coming soon</p>
                  </div>
                </div>
              } />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
