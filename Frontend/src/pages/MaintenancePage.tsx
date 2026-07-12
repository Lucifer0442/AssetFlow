import { useState } from 'react'
import { Plus, Upload, GripVertical } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SlideOverPanel } from '@/components/shared/SlideOverPanel'
import { Modal } from '@/components/shared/Modal'
import { mockMaintenance, mockAssets, mockUsers } from '@/lib/mockData'
import type { MaintenanceRequest, MaintenanceStatus } from '@/types'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

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
  const [requests, setRequests] = useState(mockMaintenance)
  const [selected, setSelected] = useState<MaintenanceRequest | null>(null)
  const [showRaise, setShowRaise] = useState(false)

  const byStatus = (status: MaintenanceStatus) => requests.filter(r => r.status === status)

  const handleApprove = (id: string) => {
    setRequests(rs => rs.map(r => r.id === id ? { ...r, status: 'Approved' as MaintenanceStatus } : r))
    toast.success('Request approved')
    setSelected(null)
  }

  const handleReject = (id: string) => {
    setRequests(rs => rs.map(r => r.id === id ? { ...r, status: 'Rejected' as MaintenanceStatus } : r))
    toast.error('Request rejected')
    setSelected(null)
  }

  return (
    <>
      <div className="space-y-5 max-w-full">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[28px] font-bold" style={{ color: '#1A1621' }}>Maintenance Management</h1>
            <p className="text-sm mt-0.5" style={{ color: '#6B6470' }}>Track and resolve maintenance requests</p>
          </div>
          <button onClick={() => setShowRaise(true)} className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold hover:brightness-90" style={{ background: '#7A3B5E' }}>
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
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORITY_DOT[req.priority] }} />
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
            {/* Rejected — collapsed */}
            <div className="w-10 flex-shrink-0">
              <div className="h-full rounded-2xl border flex flex-col items-center py-4 gap-2" style={{ background: '#F7F7F9', borderColor: '#E7E5EA' }}>
                <span className="text-[10px] font-semibold" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: '#9C97A3' }}>
                  Rejected ({requests.filter(r => r.status === 'Rejected').length})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <SlideOverPanel open={!!selected} onClose={() => setSelected(null)} title={selected?.assetName ?? ''} subtitle={`${selected?.assetTag} · Raised by ${selected?.requestedByName}`}>
        {selected && (
          <div className="p-6 space-y-5">
            <div className="flex gap-2"><StatusBadge status={selected.status} /><StatusBadge status={selected.priority} /></div>
            <div><p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9C97A3', letterSpacing: '0.06em' }}>Description</p>
              <p className="text-sm p-3.5 rounded-xl" style={{ background: '#F7F7F9', color: '#6B6470', border: '1px solid #E7E5EA' }}>{selected.description}</p></div>
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
                <button onClick={() => handleApprove(selected.id)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-90" style={{ background: '#0F9D58' }}>✓ Approve</button>
                <button onClick={() => handleReject(selected.id)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-red-50" style={{ color: '#C0392B', borderColor: '#F0B8B3', background: '#FBEAE8' }}>✗ Reject</button>
              </div>
            )}
            {selected.status === 'Approved' && (
              <div><p className="text-xs font-semibold mb-2" style={{ color: '#1A1621' }}>Assign Technician</p>
                <select className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none bg-white mb-2" style={{ borderColor: '#E7E5EA' }}>
                  {mockUsers.map(u => <option key={u.id}>{u.name}</option>)}</select>
                <button onClick={() => toast.success('Technician assigned!')} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-90" style={{ background: '#7A3B5E' }}>Assign</button></div>
            )}
          </div>
        )}
      </SlideOverPanel>

      {/* Raise Request Modal */}
      <Modal open={showRaise} onClose={() => setShowRaise(false)} title="Raise Maintenance Request" size="lg"
        footer={<><button onClick={() => setShowRaise(false)} className="px-4 py-2 text-sm font-medium rounded-xl border hover:bg-slate-50" style={{ borderColor: '#E7E5EA', color: '#6B6470' }}>Cancel</button>
        <button onClick={() => { toast.success('Request submitted!'); setShowRaise(false) }} className="px-4 py-2 text-sm font-semibold text-white rounded-xl hover:brightness-90" style={{ background: '#7A3B5E' }}>Submit →</button></>}
      >
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Asset</label>
            <select className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none bg-white" style={{ borderColor: '#E7E5EA' }}>
              {mockAssets.map(a => <option key={a.id}>{a.tag} — {a.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-2" style={{ color: '#1A1621' }}>Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {['Critical', 'High', 'Medium', 'Low'].map(p => (
                <label key={p} className="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-xs transition-all" style={{ borderColor: '#E7E5EA' }}>
                  <input type="radio" name="priority" value={p} className="accent-[#7A3B5E]" />
                  <span className="font-semibold" style={{ color: '#1A1621' }}>{p}</span>
                </label>
              ))}</div></div>
          <div><label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Description</label>
            <textarea className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none resize-none" style={{ borderColor: '#E7E5EA' }} rows={4} /></div>
          <div><label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Photo (optional)</label>
            <div className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors" style={{ borderColor: '#D8B8CA' }}>
              <Upload className="w-5 h-5 mx-auto mb-2" style={{ color: '#9C97A3' }} />
              <p className="text-xs" style={{ color: '#9C97A3' }}>Upload a photo of the issue</p>
            </div></div>
        </div>
      </Modal>
    </>
  )
}
