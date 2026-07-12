import { useState } from 'react'
import { Plus, ArrowRightLeft, RotateCcw, CheckCheck } from 'lucide-react'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Modal } from '@/components/shared/Modal'
import { ConflictAlert } from '@/components/shared/ConflictAlert'
import { mockAllocations, mockTransfers, mockAssets, mockUsers } from '@/lib/mockData'
import type { AllocationRecord, Transfer } from '@/types'
import { formatDate, isOverdue } from '@/lib/utils'
import { toast } from 'sonner'

type Tab = 'allocations' | 'transfers'

const tagStyle = { background: '#F0E8ED', color: '#7A3B5E' }
const inputCls = "w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all bg-white"
const inputStyle = { borderColor: '#E7E5EA', color: '#1A1621' }

export function AllocationsPage() {
  const [tab, setTab] = useState<Tab>('allocations')
  const [showAllocate, setShowAllocate] = useState(false)
  const [showReturn, setShowReturn] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState('')
  const [conflict, setConflict] = useState<{ holderName: string; assetName: string } | null>(null)

  const handleAssetSelect = (assetId: string) => {
    setSelectedAsset(assetId)
    const asset = mockAssets.find(a => a.id === assetId)
    if (!asset) return
    setConflict(asset.status === 'Allocated' && asset.assignedTo ? { holderName: asset.assignedTo, assetName: asset.name } : null)
  }

  const allocColumns: Column<AllocationRecord>[] = [
    { key: 'assetTag', header: 'Asset Tag', render: r => <span className="font-mono text-xs font-semibold px-2 py-1 rounded" style={tagStyle}>{r.assetTag}</span> },
    { key: 'assetName', header: 'Asset', sortable: true, render: r => <span className="font-semibold" style={{ color: '#1A1621' }}>{r.assetName}</span> },
    { key: 'holderName', header: 'Holder', sortable: true },
    { key: 'holderDepartment', header: 'Department' },
    { key: 'allocatedDate', header: 'Allocated', sortable: true, render: r => formatDate(r.allocatedDate) },
    { key: 'expectedReturn', header: 'Expected Return', render: r => r.expectedReturn ? (
      <span style={{ color: isOverdue(r.expectedReturn) && r.status === 'Active' ? '#C0392B' : '#6B6470', fontWeight: isOverdue(r.expectedReturn) ? 600 : 400 }}>
        {formatDate(r.expectedReturn)}{isOverdue(r.expectedReturn) && r.status === 'Active' && ' ⚠️'}
      </span>
    ) : <span style={{ color: '#9C97A3' }}>Indefinite</span> },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'actions', header: '', render: r => r.status === 'Active' ? (
      <button onClick={e => { e.stopPropagation(); setShowReturn(true) }} className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl transition-all hover:brightness-90" style={{ background: '#E5F7EC', color: '#0F9D58' }}>
        <RotateCcw className="w-3.5 h-3.5" /> Return
      </button>
    ) : null },
  ]

  const transferColumns: Column<Transfer>[] = [
    { key: 'assetTag', header: 'Asset Tag', render: r => <span className="font-mono text-xs font-semibold px-2 py-1 rounded" style={tagStyle}>{r.assetTag}</span> },
    { key: 'assetName', header: 'Asset', sortable: true },
    { key: 'fromUserName', header: 'From', render: r => <span style={{ color: '#1A1621' }}>{r.fromUserName}</span> },
    { key: 'toUserName', header: 'To', render: r => <span style={{ color: '#6B6470' }}>→ {r.toUserName}</span> },
    { key: 'requestedAt', header: 'Requested', render: r => formatDate(r.requestedAt) },
    { key: 'status', header: 'Status', render: r => (
      <div className="flex items-center gap-2">
        <StatusBadge status={r.status} />
        <div className="hidden md:flex items-center gap-1">
          {(['Requested', 'Approved', 'Reallocated'] as const).map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="w-2 h-2 rounded-full" style={{ background: ['Requested', 'Approved', 'Reallocated'].indexOf(r.status) >= i ? '#7A3B5E' : '#E7E5EA' }} />
              {i < 2 && <div className="w-6 h-0.5" style={{ background: ['Requested', 'Approved', 'Reallocated'].indexOf(r.status) > i ? '#7A3B5E' : '#E7E5EA' }} />}
            </div>
          ))}
        </div>
      </div>
    )},
    { key: 'actions', header: '', render: r => r.status === 'Requested' ? (
      <button onClick={() => toast.success('Transfer approved!')} className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl" style={{ background: '#F0E8ED', color: '#7A3B5E' }}>
        <CheckCheck className="w-3.5 h-3.5" /> Approve
      </button>
    ) : null },
  ]

  const tabStyle = (active: boolean) => active
    ? { background: '#7A3B5E', color: 'white', borderRadius: '10px' }
    : { color: '#6B6470', background: 'transparent' }

  return (
    <>
      <div className="space-y-5 max-w-7xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-[28px] font-bold" style={{ color: '#1A1621' }}>Allocations & Transfers</h1>
            <p className="text-sm mt-0.5" style={{ color: '#6B6470' }}>Manage asset assignments and transfer requests</p>
          </div>
          <button onClick={() => { setShowAllocate(true); setConflict(null); setSelectedAsset('') }} className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold hover:brightness-90" style={{ background: '#7A3B5E' }}>
            <Plus className="w-4 h-4" /> Allocate Asset
          </button>
        </div>

        <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: '#F7F7F9', border: '1px solid #E7E5EA' }}>
          <button onClick={() => setTab('allocations')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all" style={tabStyle(tab === 'allocations')}>
            <ArrowRightLeft className="w-4 h-4" /> Allocations
          </button>
          <button onClick={() => setTab('transfers')} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all" style={tabStyle(tab === 'transfers')}>
            <RotateCcw className="w-4 h-4" /> Transfer Requests
          </button>
        </div>

        {/* Summary chips */}
        <div className="flex gap-2 flex-wrap">
          {['Active', 'Overdue', 'Returned'].map(s => (
            <div key={s} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl text-sm" style={{ border: '1px solid #E7E5EA' }}>
              <StatusBadge status={s} />
              <span className="font-bold" style={{ color: '#1A1621' }}>{mockAllocations.filter(a => a.status === s).length}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7E5EA' }}>
          {tab === 'allocations' ? <DataTable columns={allocColumns} data={mockAllocations} /> : <DataTable columns={transferColumns} data={mockTransfers} />}
        </div>
      </div>

      {/* Modals */}
      <Modal open={showAllocate} onClose={() => setShowAllocate(false)} title="Allocate Asset" size="lg"
        footer={!conflict ? (
          <><button onClick={() => setShowAllocate(false)} className="px-4 py-2 text-sm font-medium rounded-xl border hover:bg-slate-50" style={{ borderColor: '#E7E5EA', color: '#6B6470' }}>Cancel</button>
          <button onClick={() => { toast.success('Asset allocated!'); setShowAllocate(false) }} className="px-4 py-2 text-sm font-semibold text-white rounded-xl hover:brightness-90" style={{ background: '#7A3B5E' }}>Allocate →</button></>
        ) : undefined}
      >
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Select Asset</label>
            <select className={inputCls} style={inputStyle} onChange={e => handleAssetSelect(e.target.value)} value={selectedAsset}>
              <option value="">Choose an asset…</option>
              {mockAssets.map(a => <option key={a.id} value={a.id}>{a.tag} — {a.name} ({a.status})</option>)}
            </select></div>
          {conflict && <ConflictAlert holderName={conflict.holderName} assetName={conflict.assetName} onRequestTransfer={() => { setShowAllocate(false); setShowTransfer(true) }} />}
          {!conflict && selectedAsset && (
            <>
              <div><label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Assign To</label>
                <select className={inputCls} style={inputStyle}>
                  <option>Select employee…</option>
                  {mockUsers.map(u => <option key={u.id}>{u.name} — {u.department}</option>)}
                </select></div>
              <div><label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Expected Return <span style={{ color: '#9C97A3' }}>(optional)</span></label>
                <input type="date" className={inputCls} style={inputStyle} /></div>
            </>
          )}
        </div>
      </Modal>

      <Modal open={showReturn} onClose={() => setShowReturn(false)} title="Return Asset" size="md"
        footer={<><button onClick={() => setShowReturn(false)} className="px-4 py-2 text-sm font-medium rounded-xl border hover:bg-slate-50" style={{ borderColor: '#E7E5EA', color: '#6B6470' }}>Cancel</button>
        <button onClick={() => { toast.success('Asset returned!'); setShowReturn(false) }} className="px-4 py-2 text-sm font-semibold text-white rounded-xl" style={{ background: '#0F9D58' }}>Confirm Return</button></>}
      >
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Condition on Return</label>
            <select className={inputCls} style={inputStyle}><option>Good</option><option>Fair</option><option>Poor</option><option>Damaged</option></select></div>
          <div><label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Notes</label>
            <textarea className={inputCls} style={inputStyle} rows={3} /></div>
        </div>
      </Modal>

      <Modal open={showTransfer} onClose={() => setShowTransfer(false)} title="Request Transfer" size="md"
        footer={<><button onClick={() => setShowTransfer(false)} className="px-4 py-2 text-sm font-medium rounded-xl border hover:bg-slate-50" style={{ borderColor: '#E7E5EA', color: '#6B6470' }}>Cancel</button>
        <button onClick={() => { toast.success('Transfer submitted!'); setShowTransfer(false) }} className="px-4 py-2 text-sm font-semibold text-white rounded-xl hover:brightness-90" style={{ background: '#7A3B5E' }}>Submit →</button></>}
      >
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Transfer To</label>
            <select className={inputCls} style={inputStyle}>{mockUsers.map(u => <option key={u.id}>{u.name} — {u.department}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Reason</label>
            <textarea className={inputCls} style={inputStyle} rows={3} /></div>
        </div>
      </Modal>
    </>
  )
}
