import { useState } from 'react'
import { Plus, CheckCircle2, XCircle, AlertTriangle, ChevronRight, Users } from 'lucide-react'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Modal } from '@/components/shared/Modal'
import { mockAuditCycles, mockAuditItems, mockUsers } from '@/lib/mockData'
import type { AuditCycle, AuditItem, CheckStatus } from '@/types'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export function AuditsPage() {
  const [selected, setSelected] = useState<AuditCycle | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showClose, setShowClose] = useState(false)
  const [checkItems, setCheckItems] = useState(mockAuditItems)

  const cycleColumns: Column<AuditCycle>[] = [
    { key: 'name', header: 'Cycle Name', sortable: true, render: r => <span className="font-semibold" style={{ color: '#1A1621' }}>{r.name}</span> },
    { key: 'scope', header: 'Scope' },
    { key: 'startDate', header: 'Date Range', render: r => `${formatDate(r.startDate)} – ${formatDate(r.endDate)}` },
    { key: 'auditors', header: 'Auditors', render: r => (
      <div className="flex -space-x-2">
        {r.auditors.map(a => (
          <div key={a.id} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #7A3B5E, #3D1F35)' }} title={a.name}>
            {a.name.charAt(0)}
          </div>
        ))}
      </div>
    )},
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'discrepancy', header: 'Discrepancies', render: r => (
      <span className="font-bold" style={{ color: r.missingCount + r.damagedCount > 0 ? '#C0392B' : '#0F9D58' }}>
        {r.missingCount + r.damagedCount}
      </span>
    )},
    { key: 'actions', header: '', render: r => (
      <button onClick={() => setSelected(r)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl transition-all" style={{ background: '#F0E8ED', color: '#7A3B5E' }}>
        View <ChevronRight className="w-3 h-3" />
      </button>
    )},
  ]

  const toggleItem = (id: string, status: CheckStatus) => setCheckItems(items => items.map(i => i.id === id ? { ...i, status } : i))
  const cycleItems = checkItems.filter(i => i.cycleId === selected?.id)
  const progress = selected ? Math.round((cycleItems.filter(i => i.status === 'Verified').length / Math.max(cycleItems.length, 1)) * 100) : 0

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all"
  const inputStyle = { borderColor: '#E7E5EA', color: '#1A1621' }

  return (
    <>
      {!selected ? (
        <div className="space-y-5 max-w-7xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-[28px] font-bold" style={{ color: '#1A1621' }}>Asset Audits</h1>
              <p className="text-sm mt-0.5" style={{ color: '#6B6470' }}>Create and manage audit cycles</p>
            </div>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold hover:brightness-90" style={{ background: '#7A3B5E' }}>
              <Plus className="w-4 h-4" /> Create Cycle
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Active Cycles', value: mockAuditCycles.filter(c => c.status === 'Active').length, iconBg: '#E5F7EC', iconColor: '#0F9D58', emoji: '🟢' },
              { label: 'Draft Cycles', value: mockAuditCycles.filter(c => c.status === 'Draft').length, iconBg: '#F7F7F9', iconColor: '#6B6470', emoji: '📝' },
              { label: 'Completed', value: mockAuditCycles.filter(c => c.status === 'Completed').length, iconBg: '#F0E8ED', iconColor: '#7A3B5E', emoji: '✅' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-5 flex items-center gap-3" style={{ border: '1px solid #E7E5EA' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: s.iconBg }}>{s.emoji}</div>
                <div>
                  <p className="text-[28px] font-bold leading-none" style={{ color: '#1A1621' }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B6470' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7E5EA' }}>
            <DataTable columns={cycleColumns} data={mockAuditCycles} />
          </div>
        </div>
      ) : (
        /* Cycle Detail */
        <div className="space-y-5 max-w-7xl">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:brightness-75" style={{ color: '#7A3B5E' }}>
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Cycles
          </button>

          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-[28px] font-bold" style={{ color: '#1A1621' }}>{selected.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={selected.status} />
                <span className="text-sm" style={{ color: '#6B6470' }}>{selected.scope} · {formatDate(selected.startDate)} – {formatDate(selected.endDate)}</span>
              </div>
            </div>
            {selected.status === 'Active' && (
              <button onClick={() => setShowClose(true)} className="px-4 py-2 text-white rounded-xl text-sm font-semibold hover:brightness-90" style={{ background: '#0F9D58' }}>
                Close Cycle
              </button>
            )}
          </div>

          {/* Progress card */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E7E5EA' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#6B6470', letterSpacing: '0.06em' }}>Audit Progress</p>
              <span className="text-lg font-bold" style={{ color: '#7A3B5E' }}>{progress}%</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#F7F7F9' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: '#7A3B5E' }} />
            </div>
            <div className="flex gap-6 mt-4">
              {[
                { label: 'Verified', count: cycleItems.filter(i => i.status === 'Verified').length, color: '#0F9D58' },
                { label: 'Pending', count: cycleItems.filter(i => i.status === 'Pending').length, color: '#D97706' },
                { label: 'Missing', count: cycleItems.filter(i => i.status === 'Missing').length, color: '#C0392B' },
                { label: 'Damaged', count: cycleItems.filter(i => i.status === 'Damaged').length, color: '#D97706' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.count}</p>
                  <p className="text-xs" style={{ color: '#9C97A3' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7E5EA' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #E7E5EA' }}>
              <h3 className="font-semibold text-sm" style={{ color: '#1A1621' }}>Asset Checklist</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr style={{ background: '#F7F7F9', borderBottom: '1px solid #E7E5EA' }}>
                  {['Asset Tag', 'Asset Name', 'Category', 'Location', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y" style={{ borderColor: '#F7F7F9' }}>
                  {cycleItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors" style={{ height: '56px' }}>
                      <td className="px-4 py-3"><span className="font-mono text-xs font-semibold px-2 py-1 rounded" style={{ background: '#F0E8ED', color: '#7A3B5E' }}>{item.assetTag}</span></td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#1A1621' }}>{item.assetName}</td>
                      <td className="px-4 py-3" style={{ color: '#6B6470' }}>{item.category}</td>
                      <td className="px-4 py-3" style={{ color: '#6B6470' }}>{item.location}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => toggleItem(item.id, 'Verified')} title="Mark Verified" className="p-1.5 rounded-lg hover:bg-green-50 transition-colors" style={{ color: '#0F9D58' }}><CheckCircle2 className="w-4 h-4" /></button>
                          <button onClick={() => toggleItem(item.id, 'Missing')} title="Mark Missing" className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{ color: '#C0392B' }}><XCircle className="w-4 h-4" /></button>
                          <button onClick={() => toggleItem(item.id, 'Damaged')} title="Mark Damaged" className="p-1.5 rounded-lg transition-colors" style={{ color: '#D97706' }}><AlertTriangle className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discrepancy Report */}
          {cycleItems.some(i => ['Missing', 'Damaged'].includes(i.status)) && (
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #F0B8B3' }}>
              <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #F0B8B3', background: '#FBEAE8' }}>
                <AlertTriangle className="w-4 h-4" style={{ color: '#C0392B' }} />
                <h3 className="font-semibold text-sm" style={{ color: '#C0392B' }}>Discrepancy Report</h3>
              </div>
              <div className="p-5 space-y-2">
                {cycleItems.filter(i => ['Missing', 'Damaged'].includes(i.status)).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#FBEAE8', border: '1px solid #F0B8B3' }}>
                    <div>
                      <span className="font-mono text-xs mr-2" style={{ color: '#C0392B' }}>{item.assetTag}</span>
                      <span className="text-sm font-semibold" style={{ color: '#C0392B' }}>{item.assetName}</span>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Cycle Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Audit Cycle" size="lg"
        footer={<><button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium rounded-xl border hover:bg-slate-50" style={{ borderColor: '#E7E5EA', color: '#6B6470' }}>Cancel</button>
        <button onClick={() => { toast.success('Audit cycle created!'); setShowCreate(false) }} className="px-4 py-2 text-sm font-semibold text-white rounded-xl hover:brightness-90" style={{ background: '#7A3B5E' }}>Create →</button></>}
      >
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Cycle Name</label>
            <input className={inputCls} style={inputStyle} placeholder="e.g. Q4 2024 Audit"
              onFocus={e => e.target.style.borderColor = '#7A3B5E'} onBlur={e => e.target.style.borderColor = '#E7E5EA'} /></div>
          <div><label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Scope</label>
            <input className={inputCls} style={inputStyle} placeholder="e.g. All IT Equipment…"
              onFocus={e => e.target.style.borderColor = '#7A3B5E'} onBlur={e => e.target.style.borderColor = '#E7E5EA'} /></div>
          <div className="grid grid-cols-2 gap-3">
            {['Start Date', 'End Date'].map(l => (
              <div key={l}><label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>{l}</label>
                <input type="date" className={inputCls + ' bg-white'} style={inputStyle} /></div>
            ))}
          </div>
          <div><label className="block text-sm font-medium mb-2" style={{ color: '#1A1621' }}>Auditors</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {mockUsers.map(u => (
                <label key={u.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition-all hover:border-opacity-80" style={{ borderColor: '#E7E5EA' }}>
                  <input type="checkbox" className="accent-[#7A3B5E]" />
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #7A3B5E, #3D1F35)' }}>{u.name.charAt(0)}</div>
                  <span className="text-sm" style={{ color: '#1A1621' }}>{u.name}</span>
                  <span className="text-xs ml-auto" style={{ color: '#9C97A3' }}>{u.department}</span>
                </label>
              ))}
            </div></div>
        </div>
      </Modal>

      {/* Close Cycle Confirmation */}
      <Modal open={showClose} onClose={() => setShowClose(false)} title="Close Audit Cycle" size="sm"
        footer={<><button onClick={() => setShowClose(false)} className="px-4 py-2 text-sm font-medium rounded-xl border hover:bg-slate-50" style={{ borderColor: '#E7E5EA', color: '#6B6470' }}>Cancel</button>
        <button onClick={() => { toast.success('Audit cycle closed!'); setShowClose(false); setSelected(null) }} className="px-4 py-2 text-sm font-semibold text-white rounded-xl hover:brightness-90" style={{ background: '#0F9D58' }}>Close Cycle</button></>}
      >
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl flex items-start gap-3" style={{ background: '#FEF3E2', border: '1px solid #FCD9A0' }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
            <p className="text-sm" style={{ color: '#B45309' }}>This will finalize the audit cycle. Discrepancies will be locked.</p>
          </div>
          {cycleItems.some(i => ['Missing', 'Damaged'].includes(i.status)) && (
            <p className="text-sm" style={{ color: '#C0392B' }}>⚠️ {cycleItems.filter(i => ['Missing', 'Damaged'].includes(i.status)).length} discrepancies will be recorded.</p>
          )}
        </div>
      </Modal>
    </>
  )
}
