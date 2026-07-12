import { useState } from 'react'
import { Plus, AlertCircle, X } from 'lucide-react'
import { Calendar, dateFnsLocalizer, type Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enIN } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Modal } from '@/components/shared/Modal'
import { apiService } from '@/lib/apiService'
import type { Booking } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { 'en-IN': enIN } })

const statusColors: Record<string, string> = {
  Upcoming: '#7A3B5E', Ongoing: '#0F8B7F', Completed: '#9C97A3', Cancelled: '#C0392B',
}

export function BookingsPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [selectedResource, setSelectedResource] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [overlapError, setOverlapError] = useState<string | null>(null)
  const [view, setView] = useState<'month' | 'week' | 'day'>('week')

  // Form states
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  // Queries using TanStack Query
  const { data: resources = [] } = useQuery({
    queryKey: ['resources'],
    queryFn: apiService.getResources,
  })

  // Set default resource once loaded
  useMemo(() => {
    if (resources.length > 0 && !selectedResource) {
      setSelectedResource(resources[0].id)
    }
  }, [resources, selectedResource])

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: apiService.getBookings,
  })

  const resourceBookings = bookings.filter(b => b.resourceId === selectedResource)
  const myBookings = bookings.filter(b => b.bookedById === user?.id)

  const events: Event[] = useMemo(() => resourceBookings.map(b => ({
    id: b.id,
    title: `${b.title} (${b.bookedByName})`,
    start: new Date(b.startTime),
    end: new Date(b.endTime),
    resource: b,
  })), [resourceBookings])

  const checkOverlap = (start: string, end: string): Booking | undefined =>
    resourceBookings.find(b => new Date(start) < new Date(b.endTime) && new Date(end) > new Date(b.startTime) && b.status !== 'Cancelled')

  // Mutation
  const createMutation = useMutation({
    mutationFn: apiService.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Resource booked successfully!')
      setShowCreate(false)
      setTitle('')
      setStartTime('')
      setEndTime('')
      setOverlapError(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create booking')
    }
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiService.cancelBooking(id, 'User cancelled booking'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking cancelled successfully!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel booking')
    }
  })

  const handleBook = () => {
    if (!title) return toast.error('Booking Title is required')
    if (!startTime || !endTime) return toast.error('Start and End times are required')

    const startISO = new Date(startTime).toISOString()
    const endISO = new Date(endTime).toISOString()

    const conflict = checkOverlap(startISO, endISO)
    if (conflict) {
      setOverlapError(`Conflicts with "${conflict.title}" (${formatDateTime(conflict.startTime)} – ${formatDateTime(conflict.endTime)})`)
      return
    }

    createMutation.mutate({
      resourceId: selectedResource,
      title,
      startTime: startISO,
      endTime: endISO,
    })
  }

  const selectedRes = resources.find(r => r.id === selectedResource)

  const handleEventSelect = (event: any) => {
    const booking = event.resource as Booking
    if (booking.bookedById === user?.id && booking.status !== 'Cancelled') {
      if (window.confirm(`Would you like to cancel your booking "${booking.title}"?`)) {
        cancelMutation.mutate(booking.id)
      }
    }
  }

  return (
    <>
      <div className="space-y-5 max-w-7xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[28px] font-bold" style={{ color: '#1A1621' }}>Resource Booking</h1>
            <p className="text-sm mt-0.5" style={{ color: '#6B6470' }}>Book shared resources — conflicts auto-rejected</p>
          </div>
          <button onClick={() => { setOverlapError(null); setShowCreate(true) }} className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold hover:brightness-90 cursor-pointer" style={{ background: '#7A3B5E' }}>
            <Plus className="w-4 h-4" /> New Booking
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Resource sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#6B6470', letterSpacing: '0.06em' }}>Resources</h3>
            {resources.map(r => (
              <button key={r.id} onClick={() => setSelectedResource(r.id)} className="w-full text-left px-3.5 py-3 rounded-2xl border transition-all cursor-pointer"
                style={selectedResource === r.id ? { borderColor: '#7A3B5E', background: '#F0E8ED' } : { borderColor: '#E7E5EA', background: 'white' }}>
                <p className="text-sm font-semibold" style={{ color: selectedResource === r.id ? '#7A3B5E' : '#1A1621' }}>{r.name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#9C97A3' }}>{r.type} · {r.location}</p>
                {r.capacity && <p className="text-xs mt-0.5" style={{ color: '#9C97A3' }}>Capacity: {r.capacity}</p>}
              </button>
            ))}
            {/* My bookings */}
            <div className="mt-4 rounded-2xl p-4" style={{ border: '1px solid #E7E5EA', background: 'white' }}>
              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#6B6470' }}>My Bookings</h4>
              {myBookings.length === 0 ? (
                <p className="text-xs" style={{ color: '#9C97A3' }}>You have no reservations</p>
              ) : (
                myBookings.slice(0, 3).map(b => (
                  <div key={b.id} className="mb-3 last:mb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold" style={{ color: '#1A1621' }}>{b.title}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: '#9C97A3' }}>{b.resourceName}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-3 bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7E5EA' }}>
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid #E7E5EA' }}>
              <h3 className="font-semibold text-sm" style={{ color: '#1A1621' }}>{selectedRes?.name} Schedule</h3>
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#F7F7F9', border: '1px solid #E7E5EA' }}>
                {(['month', 'week', 'day'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer"
                    style={view === v ? { background: '#7A3B5E', color: 'white' } : { color: '#9C97A3' }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4" style={{ height: 520 }}>
              <Calendar localizer={localizer} events={events} view={view}
                onView={v => setView(v as 'month' | 'week' | 'day')}
                onSelectSlot={() => { setOverlapError(null); setShowCreate(true) }} selectable
                onSelectEvent={handleEventSelect}
                style={{ height: '100%' }}
                eventPropGetter={event => {
                  const booking = (event as Event & { resource: Booking }).resource
                  return { style: { backgroundColor: statusColors[booking.status] ?? '#7A3B5E', borderRadius: '8px', border: 'none', padding: '2px 8px', fontSize: '12px', color: 'white' } }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create Booking Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Booking" size="lg"
        footer={
          <>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium rounded-xl border hover:bg-slate-50 cursor-pointer" style={{ borderColor: '#E7E5EA', color: '#6B6470' }}>Cancel</button>
            <button onClick={handleBook} className="px-4 py-2 text-sm font-semibold text-white rounded-xl hover:brightness-90 cursor-pointer" style={{ background: '#7A3B5E' }}>
              {createMutation.isPending ? 'Booking…' : 'Book →'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {overlapError && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl" style={{ background: '#FBEAE8', border: '1px solid #F0B8B3' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C0392B' }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#C0392B' }}>Booking Conflict</p>
                <p className="text-xs mt-0.5" style={{ color: '#C0392B' }}>{overlapError}</p>
              </div>
              <button onClick={() => setOverlapError(null)} style={{ color: '#F0B8B3' }} className="cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Resource</label>
            <select value={selectedResource} onChange={e => setSelectedResource(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none bg-white" style={{ borderColor: '#E7E5EA' }}>
              {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Booking Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#E7E5EA' }} placeholder="e.g. Q3 Sprint Planning"
              onFocus={e => e.target.style.borderColor = '#7A3B5E'} onBlur={e => e.target.style.borderColor = '#E7E5EA'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Start Time</label>
              <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none bg-white" style={{ borderColor: '#E7E5EA' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>End Time</label>
              <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none bg-white" style={{ borderColor: '#E7E5EA' }} />
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
export default BookingsPage;
