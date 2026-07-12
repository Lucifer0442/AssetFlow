import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/shared/Sidebar'
import { TopBar } from '@/components/shared/TopBar'
import { Toaster } from 'sonner'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#3D1F35' }}>
      <Sidebar />
      {/* Content shifts right from sidebar */}
      <div className="flex-1 flex flex-col min-w-0 ml-[240px] transition-[margin] duration-300">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6" style={{ background: '#F7F7F9' }}>
          <Outlet />
        </main>
      </div>
      <Toaster richColors position="bottom-right" />
    </div>
  )
}
