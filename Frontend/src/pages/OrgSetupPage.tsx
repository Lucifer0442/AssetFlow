import { useState } from 'react'
import { Plus, Pencil, Trash2, Users, FolderTree, UserSquare2 } from 'lucide-react'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Modal } from '@/components/shared/Modal'
import { mockDepartments, mockCategories, mockUsers } from '@/lib/mockData'
import type { Department, AssetCategory, User } from '@/types'

type Tab = 'departments' | 'categories' | 'employees'

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all"
const inputStyle = { borderColor: '#E7E5EA', color: '#1A1621', background: 'white' }
const labelStyle = { color: '#1A1621' }

const tabStyle = (active: boolean) => active
  ? { background: '#7A3B5E', color: 'white', borderRadius: '10px' }
  : { color: '#6B6470', background: 'transparent' }

export function OrgSetupPage() {
  const [tab, setTab] = useState<Tab>('departments')

  const tabs = [
    { id: 'departments' as Tab, label: 'Departments', icon: FolderTree },
    { id: 'categories' as Tab, label: 'Asset Categories', icon: FolderTree },
    { id: 'employees' as Tab, label: 'Employee Directory', icon: Users },
  ]

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-[28px] font-bold" style={{ color: '#1A1621' }}>Organization Setup</h1>
        <p className="mt-0.5 text-sm" style={{ color: '#6B6470' }}>Manage departments, asset categories, and employees</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: '#F7F7F9', border: '1px solid #E7E5EA' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all" style={tabStyle(tab === t.id)}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'departments' && <DepartmentsTab />}
      {tab === 'categories' && <CategoriesTab />}
      {tab === 'employees' && <EmployeesTab />}
    </div>
  )
}

function SectionCard({ title, count, action, children }: { title: string; count: number; action: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7E5EA' }}>
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E7E5EA' }}>
        <h3 className="font-semibold text-sm" style={{ color: '#1A1621' }}>{title} <span style={{ color: '#9C97A3' }}>({count})</span></h3>
        <button onClick={action} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white rounded-xl transition-all hover:brightness-90" style={{ background: '#7A3B5E' }}>
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function DepartmentsTab() {
  const [showCreate, setShowCreate] = useState(false)

  const columns: Column<Department>[] = [
    { key: 'name', header: 'Department', sortable: true, render: r => <span className="font-semibold" style={{ color: '#1A1621' }}>{r.name}</span> },
    { key: 'head', header: 'Head', sortable: true, render: r => r.head ?? '—' },
    { key: 'parent', header: 'Parent', render: r => r.parent ?? <span style={{ color: '#9C97A3' }}>Root</span> },
    { key: 'employeeCount', header: 'Employees', sortable: true, render: r => <span className="font-mono font-semibold" style={{ color: '#1A1621' }}>{r.employeeCount}</span> },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'actions', header: '', render: () => (
      <div className="flex gap-1">
        <button className="p-1.5 hover:bg-slate-100 rounded-lg" style={{ color: '#9C97A3' }}><Pencil className="w-3.5 h-3.5" /></button>
        <button className="p-1.5 hover:bg-red-50 rounded-lg" style={{ color: '#9C97A3' }}><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ]

  return (
    <>
      <SectionCard title="Departments" count={mockDepartments.length} action={() => setShowCreate(true)}>
        <DataTable columns={columns} data={mockDepartments} />
      </SectionCard>
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Department"
        footer={<><button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium rounded-xl border hover:bg-slate-50" style={{ borderColor: '#E7E5EA', color: '#6B6470' }}>Cancel</button><button className="px-4 py-2 text-sm font-semibold text-white rounded-xl hover:brightness-90" style={{ background: '#7A3B5E' }}>Create</button></>}
      >
        <div className="space-y-4">
          {[['Department Name', 'e.g. Engineering'], ['Department Head', 'Select employee']].map(([label, placeholder]) => (
            <div key={label}><label className="block text-sm font-medium mb-1.5" style={labelStyle}>{label}</label>
              <input className={inputCls} style={inputStyle} placeholder={placeholder}
                onFocus={e => e.target.style.borderColor = '#7A3B5E'} onBlur={e => e.target.style.borderColor = '#E7E5EA'} /></div>
          ))}
          <div><label className="block text-sm font-medium mb-1.5" style={labelStyle}>Parent Department</label>
            <select className={inputCls} style={{ ...inputStyle, padding: '10px 14px' }}>
              <option value="">None (Root)</option>
              {mockDepartments.map(d => <option key={d.id}>{d.name}</option>)}
            </select></div>
        </div>
      </Modal>
    </>
  )
}

function CategoriesTab() {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7E5EA' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E7E5EA' }}>
          <h3 className="font-semibold text-sm" style={{ color: '#1A1621' }}>Asset Categories <span style={{ color: '#9C97A3' }}>({mockCategories.length})</span></h3>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white rounded-xl hover:brightness-90" style={{ background: '#7A3B5E' }}>
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockCategories.map((cat: AssetCategory) => (
            <div key={cat.id} className="rounded-2xl p-4 transition-all hover:shadow-sm cursor-pointer group" style={{ border: '1px solid #E7E5EA' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#1A1621' }}>{cat.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9C97A3' }}>{cat.description}</p>
                </div>
                <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100" style={{ color: '#9C97A3' }}><Pencil className="w-3.5 h-3.5" /></button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[20px] font-bold tabular-nums" style={{ color: '#7A3B5E' }}>{cat.assetCount.toLocaleString()}</span>
                <span className="text-xs" style={{ color: '#9C97A3' }}>total assets</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Asset Category"
        footer={<><button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium rounded-xl border hover:bg-slate-50" style={{ borderColor: '#E7E5EA', color: '#6B6470' }}>Cancel</button><button className="px-4 py-2 text-sm font-semibold text-white rounded-xl hover:brightness-90" style={{ background: '#7A3B5E' }}>Create</button></>}
      >
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5" style={labelStyle}>Category Name</label>
            <input className={inputCls} style={inputStyle} placeholder="e.g. Laptops" onFocus={e => e.target.style.borderColor = '#7A3B5E'} onBlur={e => e.target.style.borderColor = '#E7E5EA'} /></div>
          <div><label className="block text-sm font-medium mb-1.5" style={labelStyle}>Description</label>
            <textarea className={inputCls} style={inputStyle} rows={3} /></div>
          <div className="pt-2" style={{ borderTop: '1px solid #E7E5EA' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#1A1621' }}>Custom Fields</p>
            <button className="text-xs font-medium flex items-center gap-1" style={{ color: '#7A3B5E' }}><Plus className="w-3 h-3" /> Add custom field</button>
          </div>
        </div>
      </Modal>
    </>
  )
}

function EmployeesTab() {
  const [showPromote, setShowPromote] = useState(false)
  const [selected, setSelected] = useState<User | null>(null)

  const columns: Column<User>[] = [
    { key: 'name', header: 'Employee', sortable: true, render: r => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7A3B5E, #3D1F35)' }}>{r.name.charAt(0)}</div>
        <div><p className="text-sm font-semibold" style={{ color: '#1A1621' }}>{r.name}</p><p className="text-xs" style={{ color: '#9C97A3' }}>{r.email}</p></div>
      </div>
    )},
    { key: 'department', header: 'Department', sortable: true },
    { key: 'role', header: 'Role', render: r => <StatusBadge status={r.role} /> },
    { key: 'actions', header: '', render: r => (
      <button onClick={() => { setSelected(r); setShowPromote(true) }} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all hover:brightness-95" style={{ background: '#F0E8ED', color: '#7A3B5E', border: 'none' }}>
        <UserSquare2 className="w-3.5 h-3.5" /> Promote
      </button>
    )},
  ]

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7E5EA' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #E7E5EA' }}>
          <h3 className="font-semibold text-sm" style={{ color: '#1A1621' }}>Employee Directory <span style={{ color: '#9C97A3' }}>({mockUsers.length})</span></h3>
        </div>
        <div className="p-5"><DataTable columns={columns} data={mockUsers} /></div>
      </div>
      <Modal open={showPromote} onClose={() => setShowPromote(false)} title="Promote Employee"
        footer={<><button onClick={() => setShowPromote(false)} className="px-4 py-2 text-sm font-medium rounded-xl border hover:bg-slate-50" style={{ borderColor: '#E7E5EA', color: '#6B6470' }}>Cancel</button><button onClick={() => setShowPromote(false)} className="px-4 py-2 text-sm font-semibold text-white rounded-xl hover:brightness-90" style={{ background: '#7A3B5E' }}>Confirm Promotion →</button></>}
      >
        {selected && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: '#F7F7F9', border: '1px solid #E7E5EA' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #7A3B5E, #3D1F35)' }}>{selected.name.charAt(0)}</div>
              <div><p className="font-semibold text-sm" style={{ color: '#1A1621' }}>{selected.name}</p><p className="text-xs" style={{ color: '#9C97A3' }}>{selected.email}</p></div>
            </div>
            <div><label className="block text-sm font-medium mb-1.5" style={labelStyle}>Promote to</label>
              <select className={inputCls} style={{ ...inputStyle, padding: '10px 14px' }}>
                <option>Asset Manager</option><option>Department Head</option><option>Admin</option>
              </select></div>
            <div className="p-3 rounded-xl" style={{ background: '#FEF3E2', border: '1px solid #FCD9A0' }}>
              <p className="text-xs font-medium" style={{ color: '#D97706' }}>⚠️ Changing a user's role updates their access permissions immediately.</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
