import {
  Package, ArrowRightLeft, Wrench, CalendarDays, Clock, RefreshCw,
  AlertTriangle, Plus, CalendarPlus, Hammer, TrendingUp,
} from 'lucide-react'
import { KPICard } from '@/components/shared/KPICard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { mockKPI, mockAllocations, mockActivityLogs, mockNotifications } from '@/lib/mockData'
import { formatDate, formatDateTime, isOverdue } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

const notifIcons: Record<string, string> = {
  allocation: '📦', maintenance: '🔧', booking: '📅', transfer: '🔄', audit: '📋', system: '⚙️',
}

const actionColors: Record<string, { bg: string; text: string }> = {
  ALLOCATED:  { bg: '#EAF1FE', text: '#2563EB' },
  CREATED:    { bg: '#E5F7EC', text: '#0F9D58' },
  APPROVED:   { bg: '#F0E8ED', text: '#7A3B5E' },
  RETURNED:   { bg: '#F7F7F9', text: '#6B6470' },
  REGISTERED: { bg: '#E5F5F4', text: '#0F8B7F' },
  REQUESTED:  { bg: '#FEF3E2', text: '#D97706' },
}

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const overdue = mockAllocations.filter(a => a.status === 'Overdue')
  const upcoming = mockAllocations.filter(a => a.expectedReturn && !isOverdue(a.expectedReturn) && a.status === 'Active').slice(0, 5)

  const btnPrimary = { background: '#7A3B5E', color: 'white' }
  const btnSecondary = { border: '1px solid #E7E5EA', background: 'white', color: '#1A1621' }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold" style={{ color: '#1A1621' }}>Dashboard Overview</h1>
          <p className="mt-0.5 text-sm" style={{ color: '#6B6470' }}>
            Welcome back, <span className="font-semibold" style={{ color: '#7A3B5E' }}>{user?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: '#9C97A3' }}>
          <RefreshCw className="w-3.5 h-3.5" /> Last synced: Just now
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="Assets Available" value={mockKPI.assetsAvailable} icon={Package} iconBg="#E5F7EC" iconColor="#0F9D58" trend={{ value: 2.4, label: 'vs last month' }} />
        <KPICard label="Assets Allocated" value={mockKPI.assetsAllocated} icon={ArrowRightLeft} iconBg="#EAF1FE" iconColor="#2563EB" />
        <KPICard label="Maintenance Today" value={mockKPI.maintenanceToday} icon={Wrench} iconBg="#FEF3E2" iconColor="#D97706" alert="3 critical · Needs attention" />
        <KPICard label="Active Bookings" value={mockKPI.activeBookings} icon={CalendarDays} iconBg="#F0E8ED" iconColor="#7A3B5E" />
        <KPICard label="Pending Transfers" value={mockKPI.pendingTransfers} icon={RefreshCw} iconBg="#FEF3E2" iconColor="#D97706" />
        <KPICard label="Upcoming Returns" value={mockKPI.upcomingReturns} icon={Clock} iconBg="#F7F7F9" iconColor="#6B6470" />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate('/assets')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-95" style={btnPrimary}>
          <Plus className="w-4 h-4" /> Register Asset
        </button>
        <button onClick={() => navigate('/bookings')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-slate-50" style={btnSecondary}>
          <CalendarPlus className="w-4 h-4" style={{ color: '#6B6470' }} /> Book Resource
        </button>
        <button onClick={() => navigate('/maintenance')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-slate-50" style={btnSecondary}>
          <Hammer className="w-4 h-4" style={{ color: '#6B6470' }} /> Raise Maintenance Request
        </button>
      </div>

      {/* Overdue + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7E5EA' }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #E7E5EA' }}>
            <AlertTriangle className="w-4 h-4" style={{ color: '#C0392B' }} />
            <h3 className="font-semibold text-sm" style={{ color: '#1A1621' }}>Overdue Returns</h3>
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FBEAE8', color: '#C0392B' }}>{overdue.length}</span>
          </div>
          {overdue.length === 0
            ? <div className="py-12 text-center text-sm" style={{ color: '#9C97A3' }}>No overdue returns 🎉</div>
            : <div className="divide-y" style={{ borderColor: '#F7F7F9' }}>
              {overdue.map(a => (
                <div key={a.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1A1621' }}>{a.assetName}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9C97A3' }}>{a.assetTag} · {a.holderName}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status="Overdue" />
                    {a.expectedReturn && <p className="text-xs mt-1" style={{ color: '#C0392B' }}>Due {formatDate(a.expectedReturn)}</p>}
                  </div>
                </div>
              ))}
            </div>
          }
        </div>

        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7E5EA' }}>
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #E7E5EA' }}>
            <TrendingUp className="w-4 h-4" style={{ color: '#2563EB' }} />
            <h3 className="font-semibold text-sm" style={{ color: '#1A1621' }}>Upcoming Returns</h3>
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#EAF1FE', color: '#2563EB' }}>{upcoming.length}</span>
          </div>
          {upcoming.length === 0
            ? <div className="py-12 text-center text-sm" style={{ color: '#9C97A3' }}>No upcoming returns</div>
            : <div className="divide-y" style={{ borderColor: '#F7F7F9' }}>
              {upcoming.map(a => (
                <div key={a.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#1A1621' }}>{a.assetName}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9C97A3' }}>{a.assetTag} · {a.holderName}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status="Active" />
                    {a.expectedReturn && <p className="text-xs mt-1" style={{ color: '#9C97A3' }}>Due {formatDate(a.expectedReturn)}</p>}
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>

      {/* Activity Feed + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7E5EA' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #E7E5EA' }}>
            <h3 className="font-semibold text-sm" style={{ color: '#1A1621' }}>Recent Activity</h3>
          </div>
          <div className="divide-y" style={{ borderColor: '#F7F7F9' }}>
            {mockActivityLogs.slice(0, 6).map(log => {
              const c = actionColors[log.action] ?? { bg: '#F7F7F9', text: '#6B6470' }
              return (
                <div key={log.id} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#F0E8ED' }}>
                    <span className="text-xs font-bold" style={{ color: '#7A3B5E' }}>{log.userName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: '#6B6470' }}>
                      <span className="font-semibold" style={{ color: '#1A1621' }}>{log.userName}</span>{' '}
                      {log.details}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#9C97A3' }}>{formatDateTime(log.timestamp)}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono flex-shrink-0" style={{ background: c.bg, color: c.text }}>{log.action}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7E5EA' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E7E5EA' }}>
            <h3 className="font-semibold text-sm" style={{ color: '#1A1621' }}>Notifications</h3>
            <button onClick={() => navigate('/notifications')} className="text-xs font-semibold hover:underline" style={{ color: '#7A3B5E' }}>View all →</button>
          </div>
          <div className="divide-y" style={{ borderColor: '#F7F7F9' }}>
            {mockNotifications.slice(0, 5).map(n => (
              <div key={n.id} className="px-5 py-3.5 flex gap-3 hover:bg-slate-50 transition-colors" style={!n.read ? { background: 'rgba(122,59,94,0.02)' } : {}}>
                <span className="text-lg flex-shrink-0">{notifIcons[n.type] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: !n.read ? '#1A1621' : '#6B6470' }}>{n.title}</p>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#7A3B5E' }} />}
                  </div>
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#9C97A3' }}>{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
