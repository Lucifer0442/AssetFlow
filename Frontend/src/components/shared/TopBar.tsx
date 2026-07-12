import { useState } from 'react'
import { Search, Bell, LogOut, User, Settings, ChevronDown, HelpCircle, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { apiService } from '@/lib/apiService'
import { formatDateTime } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'
import { useQuery } from '@tanstack/react-query'

const notifIcons: Record<string, string> = {
  allocation: '📦', maintenance: '🔧', booking: '📅', transfer: '🔄', audit: '📋', system: '⚙️',
}

export function TopBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const [search, setSearch] = useState('')

  // Query live notifications using TanStack Query
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: apiService.getNotifications,
    enabled: !!user,
  })

  const unread = notifications.filter(n => !n.read)

  return (
    <header className="h-[60px] bg-white border-b flex items-center gap-4 px-6 sticky top-0 z-30" style={{ borderColor: '#E7E5EA' }}>
      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9C97A3' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search assets, users, bookings…"
          className="w-full pl-9 pr-4 py-2 rounded-full border text-sm outline-none transition-all bg-[#F7F7F9]"
          style={{ borderColor: '#E7E5EA', color: '#1A1621', fontSize: '13px' }}
          onFocus={e => { e.target.style.borderColor = '#7A3B5E'; e.target.style.background = '#fff' }}
          onBlur={e => { e.target.style.borderColor = '#E7E5EA'; e.target.style.background = '#F7F7F9' }}
        />
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Audit Logs button */}
        <button
          onClick={() => navigate('/notifications')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:bg-slate-50 cursor-pointer"
          style={{ borderColor: '#E7E5EA', color: '#6B6470' }}
        >
          Activity Logs
        </button>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: '#E7E5EA' }} />

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(s => !s); setShowUser(false) }}
            className="relative p-2 rounded-lg transition-colors hover:bg-slate-50 cursor-pointer"
            style={{ color: '#6B6470' }}
          >
            <Bell className="w-[18px] h-[18px]" />
            {unread.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-50" style={{ border: '1px solid #E7E5EA', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #E7E5EA' }}>
                <span className="font-semibold text-sm" style={{ color: '#1A1621' }}>Notifications</span>
                {unread.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#F0E8ED', color: '#7A3B5E' }}>
                    {unread.length} new
                  </span>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y" style={{ borderColor: '#F7F7F9' }}>
                {notifications.slice(0, 5).map(n => (
                  <div key={n.id} className={`px-4 py-3 flex gap-3 hover:bg-slate-50 transition-colors`} style={!n.read ? { background: 'rgba(122,59,94,0.03)' } : {}}>
                    <span className="text-lg flex-shrink-0">{notifIcons[n.type] ?? '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold" style={{ color: !n.read ? '#1A1621' : '#6B6470' }}>{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ background: '#7A3B5E' }} />}
                      </div>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#9C97A3' }}>{n.message}</p>
                      <p className="text-[10px] mt-1" style={{ color: '#9C97A3' }}>{formatDateTime(n.createdAt)}</p>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                )}
              </div>
              <button
                onClick={() => { navigate('/notifications'); setShowNotifs(false) }}
                className="w-full py-3 text-center text-xs font-semibold transition-colors hover:bg-slate-50 cursor-pointer"
                style={{ borderTop: '1px solid #E7E5EA', color: '#7A3B5E' }}
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>

        {/* Help */}
        <button className="p-2 rounded-lg transition-colors hover:bg-slate-50 cursor-pointer" style={{ color: '#6B6470' }}>
          <HelpCircle className="w-[18px] h-[18px]" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: '#E7E5EA' }} />

        {/* User Avatar */}
        <div className="relative">
          <button
            onClick={() => { setShowUser(s => !s); setShowNotifs(false) }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7A3B5E, #3D1F35)' }}>
              {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <ChevronDown className="w-3.5 h-3.5 hidden sm:block" style={{ color: '#9C97A3' }} />
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden z-50" style={{ border: '1px solid #E7E5EA', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid #E7E5EA' }}>
                <p className="text-sm font-semibold" style={{ color: '#1A1621' }}>{user?.name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#9C97A3' }}>{user?.email}</p>
                <div className="mt-1.5"><StatusBadge status={user?.role ?? 'Employee'} /></div>
              </div>
              <div className="p-1">
                {[
                  { icon: User, label: 'Profile', color: '#1A1621' },
                  { icon: Settings, label: 'Settings', color: '#1A1621' },
                  { icon: RefreshCw, label: 'Last synced: Live', color: '#9C97A3' },
                ].map(item => (
                  <button key={item.label} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors" style={{ color: item.color }}>
                    <item.icon className="w-4 h-4" /> {item.label}
                  </button>
                ))}
                <button
                  onClick={() => { logout(); navigate('/login') }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors mt-1 cursor-pointer"
                  style={{ color: '#C0392B', borderTop: '1px solid #E7E5EA' }}
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click-away */}
      {(showNotifs || showUser) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowNotifs(false); setShowUser(false) }} />
      )}
    </header>
  )
}
export default TopBar;
