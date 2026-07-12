import { useState, useMemo } from 'react'
import { Plus, Upload, GripVertical } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SlideOverPanel } from '@/components/shared/SlideOverPanel'
import { Modal } from '@/components/shared/Modal'
import { apiService } from '@/lib/apiService'
import type { MaintenanceRequest, MaintenanceStatus } from '@/types'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const COLUMNS: { status: MaintenanceStatus; label: string; dotColor: string; headerStyle: React.CSSProperties }[] = [
  { status: 'Pending',    label: 'Pending',           dotColor: '#D97706', headerStyle: { background: '#FEF3E2', borderColor: '#FCD9A0' } },
  { status: 'Approved',   label: 'Approved',          dotColor: '#2563EB', headerStyle: { background: '#EAF1FE', borderColor: '#BFCFFD' } },
  { status: 'Assigned',   label: 'Technician Assigned', dotColor: '#7A3B5E', headerStyle: { background: '#F0E8ED', borderColor: '#D8B8CA' } },
  { status: 'InProgress', label: 'In Progress',       dotColor: '#0F8B7F', headerStyle: { background: '#E5F5F4', borderColor: '#9FD6D2' } },
  { status: 'Resolved',   label: 'Resolved',          dotColor: '#0F9D58', headerStyle: { background: '#E5F7EC', borderColor: '#B2E6C8' } },
]

const PRIORITY_DOT: Record<string, string> = {
  Critical: '#C0392B', High: '#D97706', Medium: '#2563EB', Low: '#0F9D58',
}

export function MaintenancePage() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<MaintenanceRequest | null>(null)
  const [showRaise, setShowRaise] = useState(false)

  // Raise Request states
  const [selectedAssetId, setSelectedAssetId] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [description, setDescription] = useState('')

  // Action states
  const [selectedTechId, setSelectedTechId] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')

  // Queries
  const { data: requests = [] } = useQuery({
    queryKey: ['maintenance'],
    queryFn: apiService.getMaintenanceRequests,
  })

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => apiService.getAssets(),
  })

  const { data: rawEmployees = [] } = useQuery({
    queryKey: ['raw-employees'],
    queryFn: apiService.getEmployees,
  })

  // Set default asset
  useMemo(() => {
    if (assets.length > 0 && !selectedAssetId) {
      setSelectedAssetId(assets[0].id)
    }
  }, [assets, selectedAssetId])

  // Set default tech
  useMemo(() => {
    if (rawEmployees.length > 0 && !selectedTechId) {
      setSelectedTechId(rawEmployees[0].id)
    }
  }, [rawEmployees, selectedTechId])

  const byStatus = (status: MaintenanceStatus) => requests.filter(r => r.status === status)

  // Mutations
  const raiseMutation = useMutation({
    mutationFn: apiService.raiseMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      toast.success('Maintenance request raised successfully!')
      setShowRaise(false)
      setDescription('')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to raise request')
    }
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, action, comments }: { id: string; action: 'approved' | 'rejected'; comments?: string }) =>
      apiService.approveMaintenance(id, action, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      toast.success('Ticket response recorded!')
      setSelected(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to verify request')
    }
  })

  const assignMutation = useMutation({
    mutationFn: ({ id, technicianId }: { id: string; technicianId: string }) =>
      apiService.assignMaintenance(id, technicianId, 'Assigned technician for repairs'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      toast.success('Technician assigned successfully!')
      setSelected(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to assign technician')
    }
  })

  const startMutation = useMutation({
    mutationFn: apiService.startMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      toast.success('Maintenance work started!')
      setSelected(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to start maintenance')
    }
  })

  const resolveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      apiService.resolveMaintenance(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      toast.success('Maintenance resolved!')
      setSelected(null)
      setResolutionNotes('')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to resolve maintenance')
    }
  })

  const closeMutation = useMutation({
    mutationFn: apiService.closeMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      toast.success('Maintenance ticket closed and logged!')
      setSelected(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to close maintenance')
    }
  })

  const handleRaiseSubmit = () => {
    if (!description) return toast.error('Please describe the issue')
    raiseMutation.mutate({
      assetId: selectedAssetId,
      priority,
      description,
    })
  }

  return (
    <>
      <div className="space-y-5 max-w-full">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[28px] font-bold" style={{ color: '#1A1621' }}>Maintenance Management</h1>
            <p className="text-sm mt-0.5" style={{ color: '#6B6470' }}>Track and resolve maintenance requests</p>
          </div>
          <button onClick={() => setShowRaise(true)} className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold hover:brightness-90 cursor-pointer" style={{ background: '#7A3B5E' }}>
            <Plus className="w-4 h-4" /> Raise Request
          </button>
        </div>

        {/* Summary chips */}
        <div className="flex gap-3 flex-wrap">
          {COLUMNS.map(col => (
            <div key={col.status} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl text-sm" style={{ border: '1px solid #E7E5EA' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.dotColor }} />
              <span className="text-xs" style={{ color: '#6B6470' }}>{col.label}</span>
              <span className="font-bold" style={{ color: '#1A1621' }}>{byStatus(col.status).length}</span>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map(col => (
              <div key={col.status} className="w-72 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 rounded-t-2xl border" style={col.headerStyle}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.dotColor }} />
                  <span className="text-xs font-semibold flex-1" style={{ color: col.dotColor }}>{col.label}</span>
                  <span className="text-xs font-bold" style={{ color: col.dotColor }}>{byStatus(col.status).length}</span>
                </div>
                <div className="space-y-2.5 min-h-32 p-2.5 rounded-b-2xl border border-t-0" style={{ background: '#F7F7F9', borderColor: '#E7E5EA' }}>
                  {byStatus(col.status).map(req => (
                    <div key={req.id} onClick={() => setSelected(req)}
                      className="bg-white rounded-2xl p-3.5 cursor-pointer group transition-shadow hover:shadow-md"
                      style={{ border: '1px solid #E7E5EA' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORITY_DOT[req.priority] || '#9C97A3' }} />
                            <StatusBadge status={req.priority} />
                          </div>
                          <p className="text-sm font-semibold truncate" style={{ color: '#1A1621' }}>{req.assetName}</p>
                          <p className="text-[10px] font-mono" style={{ color: '#7A3B5E' }}>{req.assetTag}</p>
                        </div>
                        <GripVertical className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 cursor-grab transition-opacity" style={{ color: '#E7E5EA' }} />
                      </div>
                      <p className="text-xs mt-2 line-clamp-2" style={{ color: '#6B6470' }}>{req.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: 'linear-gradient(135deg, #7A3B5E, #3D1F35)' }}>
                            {req.requestedByName.charAt(0)}
                          </div>
                          <span className="text-[10px]" style={{ color: '#9C97A3' }}>{req.requestedByName}</span>
                        </div>
                        <span className="text-[10px]" style={{ color: '#9C97A3' }}>{formatDate(req.createdAt)}</span>
                      </div>
                      {req.technicianName && (
                        <div className="mt-2 flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#F0E8ED' }}>
                          <span className="text-[10px]" style={{ color: '#7A3B5E' }}>🔧 {req.technicianName}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {byStatus(col.status).length === 0 && (
                    <div className="py-6 text-center text-xs" style={{ color: '#9C97A3' }}>No requests</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <SlideOverPanel open={!!selected} onClose={() => setSelected(null)} title={selected?.assetName ?? ''} subtitle={`${selected?.assetTag} · Raised by ${selected?.requestedByName}`}>
        {selected && (
          <div className="p-6 space-y-5">
            <div className="flex gap-2"><StatusBadge status={selected.status} /><StatusBadge status={selected.priority} /></div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9C97A3', letterSpacing: '0.06em' }}>Description</p>
              <p className="text-sm p-3.5 rounded-xl" style={{ background: '#F7F7F9', color: '#6B6470', border: '1px solid #E7E5EA' }}>{selected.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Raised by', selected.requestedByName], ['Date', formatDate(selected.createdAt)], ['Priority', selected.priority], ['Technician', selected.technicianName ?? '—']].map(([k, v]) => (
                <div key={String(k)} className="rounded-xl p-3" style={{ background: '#F7F7F9', border: '1px solid #E7E5EA' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9C97A3', letterSpacing: '0.06em' }}>{k}</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: '#1A1621' }}>{v}</p>
                </div>
              ))}
            </div>

            {selected.status === 'Pending' && (
              <div className="flex gap-2">
                <button onClick={() => approveMutation.mutate({ id: selected.id, action: 'approved' })} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-90 cursor-pointer" style={{ background: '#0F9D58' }}>✓ Approve</button>
                <button onClick={() => approveMutation.mutate({ id: selected.id, action: 'rejected' })} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-red-50 cursor-pointer" style={{ color: '#C0392B', borderColor: '#F0B8B3', background: '#FBEAE8' }}>✗ Reject</button>
              </div>
            )}
            
            {selected.status === 'Approved' && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: '#1A1621' }}>Assign Technician</p>
                <select value={selectedTechId} onChange={e => setSelectedTechId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none bg-white mb-2" style={{ borderColor: '#E7E5EA' }}>
                  {rawEmployees.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
                <button onClick={() => assignMutation.mutate({ id: selected.id, technicianId: selectedTechId })} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-90 cursor-pointer" style={{ background: '#7A3B5E' }}>Assign</button>
              </div>
            )}

            {selected.status === 'Assigned' && (
              <button onClick={() => startMutation.mutate(selected.id)} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-90 cursor-pointer" style={{ background: '#0F8B7F' }}>
                Start Repair Work →
              </button>
            )}

            {selected.status === 'InProgress' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#1A1621' }}>Resolution Notes</label>
                  <textarea value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none" style={{ borderColor: '#E7E5EA' }} rows={3} placeholder="Describe the resolution steps…" />
                </div>
                <button onClick={() => {
                  if (!resolutionNotes) return toast.error('Please input resolution notes')
                  resolveMutation.mutate({ id: selected.id, notes: resolutionNotes })
                }} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-90 cursor-pointer" style={{ background: '#0F9D58' }}>
                  Mark as Resolved ✓
                </button>
              </div>
            )}

            {selected.status === 'Resolved' && (
              <button onClick={() => closeMutation.mutate(selected.id)} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-90 cursor-pointer" style={{ background: '#7A3B5E' }}>
                Close Ticket & Archive
              </button>
            )}
          </div>
        )}
      </SlideOverPanel>

      {/* Raise Request Modal */}
      <Modal open={showRaise} onClose={() => setShowRaise(false)} title="Raise Maintenance Request" size="lg"
        footer={
          <>
            <button onClick={() => setShowRaise(false)} className="px-4 py-2 text-sm font-medium rounded-xl border hover:bg-slate-50 cursor-pointer" style={{ borderColor: '#E7E5EA', color: '#6B6470' }}>Cancel</button>
            <button onClick={handleRaiseSubmit} className="px-4 py-2 text-sm font-semibold text-white rounded-xl hover:brightness-90 cursor-pointer" style={{ background: '#7A3B5E' }}>
              {raiseMutation.isPending ? 'Submitting…' : 'Submit →'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Asset</label>
            <select value={selectedAssetId} onChange={e => setSelectedAssetId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none bg-white" style={{ borderColor: '#E7E5EA' }}>
              {assets.map(a => <option key={a.id} value={a.id}>{a.tag} — {a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1621' }}>Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {['Critical', 'High', 'Medium', 'Low'].map(p => (
                <label key={p} className="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-xs transition-all" style={{ borderColor: priority === p ? '#7A3B5E' : '#E7E5EA', background: priority === p ? '#F0E8ED' : 'white' }}>
                  <input type="radio" name="priority" value={p} checked={priority === p} onChange={() => setPriority(p)} className="accent-[#7A3B5E]" />
                  <span className="font-semibold" style={{ color: '#1A1621' }}>{p}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none resize-none" style={{ borderColor: '#E7E5EA' }} rows={4} placeholder="Provide failure / repair work description details…" />
          </div>
        </div>
      </Modal>
    </>
  )
}
export default MaintenancePage;
