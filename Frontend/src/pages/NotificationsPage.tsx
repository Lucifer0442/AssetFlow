import { useState } from 'react'
import { Bell, Activity, Check } from 'lucide-react'
import { apiService } from '@/lib/apiService'
import { formatDateTime } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

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

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'notifications' | 'activity'>('notifications')
  const [filter, setFilter] = useState('')

  // Queries using TanStack Query
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: apiService.getNotifications,
  })

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: apiService.getActivityLogs,
  })

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: apiService.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  const markAllReadMutation = useMutation({
    mutationFn: apiService.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All notifications marked as read')
    },
    onError: () => {
      toast.error('Failed to mark notifications as read')
    }
  })

  const markAllRead = () => {
    markAllReadMutation.mutate()
  }

  const handleNotifClick = (id: string) => {
    const notif = notifications.find(n => n.id === id)
    if (notif && !notif.read) {
      markReadMutation.mutate(id)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const filteredLogs = activityLogs.filter(l => !filter || l.action.toLowerCase().includes(filter.toLowerCase()) || l.userName.toLowerCase().includes(filter.toLowerCase()))

  const tabStyle = (active: boolean) => active
    ? { background: '#7A3B5E', color: 'white', borderRadius: '10px' }
    : { color: '#6B6470', background: 'transparent' }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-[28px] font-bold" style={{ color: '#1A1621' }}>Notifications & Activity</h1>
        <p className="text-sm mt-0.5" style={{ color: '#6B6470' }}>Stay on top of what's happening</p>
      </div>

      <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: '#F7F7F9', border: '1px solid #E7E5EA' }}>
        <button onClick={() => setTab('notifications')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer" style={tabStyle(tab === 'notifications')}>
          <Bell className="w-4 h-4" /> Notifications
          {unreadCount > 0 && <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#C0392B', color: 'white' }}>{unreadCount}</span>}
        </button>
        <button onClick={() => setTab('activity')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer" style={tabStyle(tab === 'activity')}>
          <Activity className="w-4 h-4" /> Activity Log
        </button>
      </div>

      {tab === 'notifications' && (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7E5EA' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E7E5EA' }}>
            <h3 className="font-semibold text-sm" style={{ color: '#1A1621' }}>All Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer" style={{ color: '#7A3B5E' }}>
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>
          <div className="divide-y" style={{ borderColor: '#F7F7F9' }}>
            {notifications.map(n => (
              <div key={n.id} onClick={() => handleNotifClick(n.id)}
                className="px-5 py-4 flex gap-4 cursor-pointer hover:bg-slate-50 transition-colors relative"
                style={!n.read ? { background: 'rgba(122,59,94,0.02)' } : {}}
              >
                {!n.read && <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r" style={{ background: '#7A3B5E' }} />}
                <span className="text-xl flex-shrink-0">{notifIcons[n.type] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold" style={{ color: !n.read ? '#1A1621' : '#6B6470' }}>{n.title}</p>
                    <p className="text-xs flex-shrink-0" style={{ color: '#9C97A3' }}>{formatDateTime(n.createdAt)}</p>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: '#9C97A3' }}>{n.message}</p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="py-12 text-center text-sm" style={{ color: '#9C97A3' }}>
                No notifications to display
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7E5EA' }}>
          <div className="px-5 py-4 flex items-center justify-between gap-3" style={{ borderBottom: '1px solid #E7E5EA' }}>
            <h3 className="font-semibold text-sm" style={{ color: '#1A1621' }}>Activity Log</h3>
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by user or action…"
              className="px-3 py-1.5 rounded-xl border text-xs outline-none w-52 bg-white" style={{ borderColor: '#E7E5EA', color: '#1A1621' }}
              onFocus={e => e.target.style.borderColor = '#7A3B5E'} onBlur={e => e.target.style.borderColor = '#E7E5EA'} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: '#F7F7F9', borderBottom: '1px solid #E7E5EA' }}>
                  {['Timestamp', 'User', 'Action', 'Entity', 'Details'].map(h => (
                    <th key={h} className="px-4 py-3 text-left" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9C97A3' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#F7F7F9' }}>
                {filteredLogs.map(log => {
                  const c = actionColors[log.action.toUpperCase()] ?? { bg: '#F7F7F9', text: '#6B6470' }
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors" style={{ height: '52px' }}>
                      <td className="px-4 py-3 font-mono whitespace-nowrap" style={{ color: '#9C97A3', fontSize: '11px' }}>{formatDateTime(log.timestamp)}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7A3B5E, #3D1F35)' }}>{log.userName.charAt(0)}</div>
                          <span className="font-medium" style={{ color: '#1A1621', fontSize: '12px' }}>{log.userName}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-lg font-bold text-[10px] font-mono" style={{ background: c.bg, color: c.text }}>{log.action}</span>
                      </td>
                      <td className="px-4 py-3" style={{ color: '#6B6470', fontSize: '12px' }}>
                        <span className="font-semibold" style={{ color: '#1A1621' }}>{log.entity}</span> <span style={{ color: '#9C97A3' }}>#{log.entityId}</span>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate" style={{ color: '#6B6470', fontSize: '12px' }}>{log.details || 'No additional detail'}</td>
                    </tr>
                  )
                })}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-xs" style={{ color: '#9C97A3' }}>
                      No logs matching filters found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
export default NotificationsPage;
