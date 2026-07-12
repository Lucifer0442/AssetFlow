import { useState, useMemo } from 'react'
import { Plus, CheckCircle2, XCircle, AlertTriangle, ChevronRight } from 'lucide-react'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Modal } from '@/components/shared/Modal'
import { apiService } from '@/lib/apiService'
import type { AuditCycle, AuditItem, CheckStatus } from '@/types'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function AuditsPage() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<AuditCycle | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showClose, setShowClose] = useState(false)

  // Create Cycle States
  const [name, setName] = useState('')
  const [scope, setScope] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedAuditorId, setSelectedAuditorId] = useState('')

  // Queries
  const { data: cycles = [] } = useQuery({
    queryKey: ['audit-cycles'],
    queryFn: apiService.getAuditCycles,
  })

  const { data: rawEmployees = [] } = useQuery({
    queryKey: ['raw-employees'],
    queryFn: apiService.getEmployees,
  })

  // Set default auditor choice
  useMemo(() => {
    if (rawEmployees.length > 0 && !selectedAuditorId) {
      setSelectedAuditorId(rawEmployees[0].id)
    }
  }, [rawEmployees, selectedAuditorId])

  // Retrieve selected cycle full details (with assignments & items checklist)
  const selectedCycleWithAssignments = useMemo(() => {
    if (!selected) return null
    return cycles.find(c => c.id === selected.id) || null
  }, [cycles, selected])

  const firstAssignmentId = useMemo(() => {
    // If backend returns raw cycle objects, let's find its first assignment id
    // We can extract it from the original query results
    const rawCycle = cycles.find(c => c.id === selected?.id) as any
    return rawCycle?.assignments?.[0]?.id || null
  }, [cycles, selected])

  const { data: assignmentDetails = { items: [] } } = useQuery({
    queryKey: ['audit-assignment-items', firstAssignmentId],
    queryFn: () => firstAssignmentId ? apiService.getAuditAssignment(firstAssignmentId) : Promise.resolve({ items: [] }),
    enabled: !!firstAssignmentId,
  })

  const cycleItems: AuditItem[] = assignmentDetails.items || []
  const progress = useMemo(() => {
    if (!cycleItems.length) return 0
    const verified = cycleItems.filter(i => i.status === 'Verified').length
    return Math.round((verified / cycleItems.length) * 100)
  }, [cycleItems])

  // Mutations
  const createMutation = useMutation({
    mutationFn: apiService.createAuditCycle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-cycles'] })
      toast.success('Audit cycle created successfully!')
      setShowCreate(false)
      setName('')
      setScope('')
      setStartDate('')
      setEndDate('')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create audit cycle')
    }
  })

  const verifyItemMutation = useMutation({
    mutationFn: ({ assignmentId, itemId, status, notes }: { assignmentId: string; itemId: string; status: CheckStatus; notes?: string }) =>
      apiService.verifyAuditItem(assignmentId, itemId, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-assignment-items', firstAssignmentId] })
      queryClient.invalidateQueries({ queryKey: ['audit-cycles'] })
      toast.success('Asset check updated!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to verify item')
    }
  })

  const closeMutation = useMutation({
    mutationFn: apiService.lockAuditCycle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-cycles'] })
      toast.success('Audit cycle closed and discrepancy report locked!')
      setShowClose(false)
      setSelected(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to close audit cycle')
    }
  })

  const handleCreate = () => {
    if (!name) return toast.error('Cycle Name is required')
    if (!scope) return toast.error('Scope is required (e.g. CYC-Q4)')
    if (!startDate || !endDate) return toast.error('Start and End dates are required')

    createMutation.mutate({
      name,
      cycleCode: scope,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      auditorId: selectedAuditorId || undefined,
    })
  }

  const handleToggleItem = (itemId: string, status: CheckStatus) => {
    if (!firstAssignmentId) return toast.error('No auditor assignment loaded for this cycle')
    verifyItemMutation.mutate({
      assignmentId: firstAssignmentId,
      itemId,
      status,
      notes: `Asset checked as ${status}`,
    })
  }

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
        {r.auditors.length === 0 && <span style={{ color: '#9C97A3' }} className="text-xs">No auditors assigned</span>}
      </div>
    )},
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'discrepancy', header: 'Discrepancies', render: r => (
      <span className="font-bold" style={{ color: r.missingCount + r.damagedCount > 0 ? '#C0392B' : '#0F9D58' }}>
        {r.missingCount + r.damagedCount}
      </span>
    )},
    { key: 'actions', header: '', render: r => (
      <button onClick={() => setSelected(r)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer" style={{ background: '#F0E8ED', color: '#7A3B5E' }}>
        View <ChevronRight className="w-3 h-3" />
      </button>
    )},
  ]

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all bg-white"
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
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold hover:brightness-90 cursor-pointer" style={{ background: '#7A3B5E' }}>
              <Plus className="w-4 h-4" /> Create Cycle
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Active Cycles', value: cycles.filter(c => c.status === 'Active').length, iconBg: '#E5F7EC', iconColor: '#0F9D58', emoji: '🟢' },
              { label: 'Draft Cycles', value: cycles.filter(c => c.status === 'Draft').length, iconBg: '#F7F7F9', iconColor: '#6B6470', emoji: '📝' },
              { label: 'Completed', value: cycles.filter(c => c.status === 'Completed').length, iconBg: '#F0E8ED', iconColor: '#7A3B5E', emoji: '✅' },
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
            <DataTable columns={cycleColumns} data={cycles} />
          </div>
        </div>
      ) : (
        /* Cycle Detail */
        <div className="space-y-5 max-w-7xl">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:brightness-75 cursor-pointer" style={{ color: '#7A3B5E' }}>
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Cycles
          </button>

          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-[28px] font-bold" style={{ color: '#1A1621' }}>{selectedCycleWithAssignments?.name || selected.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={selectedCycleWithAssignments?.status || selected.status} />
                <span className="text-sm" style={{ color: '#6B6470' }}>
                  {selectedCycleWithAssignments?.scope || selected.scope} · {formatDate(selectedCycleWithAssignments?.startDate || selected.startDate)} – {formatDate(selectedCycleWithAssignments?.endDate || selected.endDate)}
                </span>
              </div>
            </div>
            {(selectedCycleWithAssignments?.status === 'Active' || selected.status === 'Active') && (
              <button onClick={() => setShowClose(true)} className="px-4 py-2 text-white rounded-xl text-sm font-semibold hover:brightness-90 cursor-pointer" style={{ background: '#0F9D58' }}>
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
                <thead>
                  <tr style={{ background: '#F7F7F9', borderBottom: '1px solid #E7E5EA' }}>
                    {['Asset Tag', 'Asset Name', 'Category', 'Location', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
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
                          <button onClick={() => handleToggleItem(item.id, 'Verified')} title="Mark Verified" className="p-1.5 rounded-lg hover:bg-green-50 transition-colors cursor-pointer" style={{ color: '#0F9D58' }}><CheckCircle2 className="w-4 h-4" /></button>
                          <button onClick={() => handleToggleItem(item.id, 'Missing')} title="Mark Missing" className="p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer" style={{ color: '#C0392B' }}><XCircle className="w-4 h-4" /></button>
                          <button onClick={() => handleToggleItem(item.id, 'Damaged')} title="Mark Damaged" className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer" style={{ color: '#D97706' }}><AlertTriangle className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {cycleItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-xs" style={{ color: '#9C97A3' }}>
                        No audit items assigned to this cycle
                      </td>
                    </tr>
                  )}
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
        footer={
          <>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium rounded-xl border hover:bg-slate-50 cursor-pointer" style={{ borderColor: '#E7E5EA', color: '#6B6470' }}>Cancel</button>
            <button onClick={handleCreate} className="px-4 py-2 text-sm font-semibold text-white rounded-xl hover:brightness-90 cursor-pointer" style={{ background: '#7A3B5E' }}>
              {createMutation.isPending ? 'Creating…' : 'Create →'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Cycle Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. Q4 2024 Audit"
              onFocus={e => e.target.style.borderColor = '#7A3B5E'} onBlur={e => e.target.style.borderColor = '#E7E5EA'} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Scope (Cycle Code)</label>
            <input value={scope} onChange={e => setScope(e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. CYC-Q4"
              onFocus={e => e.target.style.borderColor = '#7A3B5E'} onBlur={e => e.target.style.borderColor = '#E7E5EA'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls + ' bg-white'} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls + ' bg-white'} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A1621' }}>Auditor</label>
            <select value={selectedAuditorId} onChange={e => setSelectedAuditorId(e.target.value)} className={inputCls} style={inputStyle}>
              {rawEmployees.map((u: any) => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Close Cycle Confirmation */}
      <Modal open={showClose} onClose={() => setShowClose(false)} title="Close Audit Cycle" size="sm"
        footer={
          <>
            <button onClick={() => setShowClose(false)} className="px-4 py-2 text-sm font-medium rounded-xl border hover:bg-slate-50 cursor-pointer" style={{ borderColor: '#E7E5EA', color: '#6B6470' }}>Cancel</button>
            <button onClick={() => closeMutation.mutate(selected?.id as string)} className="px-4 py-2 text-sm font-semibold text-white rounded-xl hover:brightness-90 cursor-pointer" style={{ background: '#0F9D58' }}>
              {closeMutation.isPending ? 'Closing…' : 'Close Cycle'}
            </button>
          </>
        }
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
export default AuditsPage;
