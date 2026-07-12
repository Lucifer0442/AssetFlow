import { useState } from 'react'
import { Download, TrendingUp, BarChart2, PieChart, Activity } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { mockDepartments, mockCategories } from '@/lib/mockData'
import { StatusBadge } from '@/components/shared/StatusBadge'

const utilizationData = [
  { month: 'Jan', utilization: 72 }, { month: 'Feb', utilization: 78 },
  { month: 'Mar', utilization: 81 }, { month: 'Apr', utilization: 76 },
  { month: 'May', utilization: 85 }, { month: 'Jun', utilization: 88 },
  { month: 'Jul', utilization: 83 },
]
const maintenanceFreq = [
  { name: 'Laptops', requests: 28 }, { name: 'Monitors', requests: 12 },
  { name: 'Vehicles', requests: 18 }, { name: 'Furniture', requests: 8 },
  { name: 'Mobile', requests: 35 }, { name: 'Conf. Room', requests: 9 },
]
const idleVsUsed = [
  { name: 'Laptops', used: 980, idle: 260 }, { name: 'Monitors', used: 720, idle: 260 },
  { name: 'Furniture', used: 2800, idle: 400 }, { name: 'Vehicles', used: 30, idle: 12 },
  { name: 'Mobile', used: 430, idle: 133 },
]
const deptAllocation = mockDepartments.slice(0, 5).map(d => ({ name: d.name, value: d.employeeCount }))
const PIE_COLORS = ['#7A3B5E', '#0F8B7F', '#0F9D58', '#2563EB', '#D97706']

function Widget({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7E5EA' }}>
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E7E5EA' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#F0E8ED' }}>
            <Icon className="w-3.5 h-3.5" style={{ color: '#7A3B5E' }} strokeWidth={1.8} />
          </div>
          <h3 className="font-semibold text-sm" style={{ color: '#1A1621' }}>{title}</h3>
        </div>
        <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-xl border transition-all hover:bg-slate-50" style={{ borderColor: '#E7E5EA', color: '#6B6470' }}>
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('2024-01-01')
  const [dateTo, setDateTo] = useState('2024-12-31')
  const [dept, setDept] = useState('')
  const [category, setCategory] = useState('')

  const selectStyle = { borderColor: '#E7E5EA', color: '#6B6470', background: 'white' }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[28px] font-bold" style={{ color: '#1A1621' }}>Reports & Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B6470' }}>Organization-wide asset insights</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold hover:brightness-90" style={{ background: '#7A3B5E' }}>
          <Download className="w-4 h-4" /> Export All
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4" style={{ border: '1px solid #E7E5EA' }}>
        <div className="flex flex-wrap gap-3 items-end">
          {['From', 'To'].map((l, i) => (
            <div key={l}><label className="block text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#6B6470', letterSpacing: '0.06em' }}>{l}</label>
              <input type="date" value={i === 0 ? dateFrom : dateTo} onChange={e => i === 0 ? setDateFrom(e.target.value) : setDateTo(e.target.value)}
                className="px-3 py-2 rounded-xl border text-sm outline-none bg-white" style={{ borderColor: '#E7E5EA' }} /></div>
          ))}
          <div><label className="block text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#6B6470', letterSpacing: '0.06em' }}>Department</label>
            <select value={dept} onChange={e => setDept(e.target.value)} className="px-3 py-2 rounded-xl border text-sm outline-none" style={selectStyle}>
              <option value="">All Departments</option>
              {mockDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          <div><label className="block text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#6B6470', letterSpacing: '0.06em' }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 rounded-xl border text-sm outline-none" style={selectStyle}>
              <option value="">All Categories</option>
              {mockCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <button className="px-4 py-2 text-sm font-semibold text-white rounded-xl hover:brightness-90" style={{ background: '#7A3B5E' }}>Apply</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Widget title="Asset Utilization Trend" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={utilizationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F7F7F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9C97A3' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9C97A3' }} unit="%" domain={[60, 100]} />
              <Tooltip formatter={(v) => [`${v}%`, 'Utilization']} contentStyle={{ borderRadius: '12px', border: '1px solid #E7E5EA', fontSize: '12px' }} />
              <Line type="monotone" dataKey="utilization" stroke="#7A3B5E" strokeWidth={2.5} dot={{ fill: '#7A3B5E', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Widget>

        <Widget title="Most Used vs Idle Assets" icon={BarChart2}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={idleVsUsed} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F7F7F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9C97A3' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9C97A3' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E7E5EA', fontSize: '12px' }} />
              <Legend />
              <Bar dataKey="used" fill="#7A3B5E" name="In Use" radius={[4, 4, 0, 0]} />
              <Bar dataKey="idle" fill="#E7E5EA" name="Idle" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Widget>

        <Widget title="Maintenance Frequency by Category" icon={Activity}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={maintenanceFreq} layout="vertical" barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F7F7F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9C97A3' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#9C97A3' }} width={90} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E7E5EA', fontSize: '12px' }} />
              <Bar dataKey="requests" fill="#0F8B7F" name="Requests" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Widget>

        <Widget title="Asset Allocation by Department" icon={PieChart}>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={220}>
              <RechartsPie>
                <Pie data={deptAllocation} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {deptAllocation.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E7E5EA', fontSize: '12px' }} />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {deptAllocation.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-xs flex-1 truncate" style={{ color: '#6B6470' }}>{d.name}</span>
                  <span className="text-xs font-bold" style={{ color: '#1A1621' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Widget>
      </div>

      {/* Due for Maintenance table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E7E5EA' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #E7E5EA' }}>
          <h3 className="font-semibold text-sm" style={{ color: '#1A1621' }}>Assets Due for Maintenance</h3>
          <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-xl border hover:bg-slate-50" style={{ borderColor: '#E7E5EA', color: '#6B6470' }}>
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
        <table className="w-full text-sm">
          <thead><tr style={{ background: '#F7F7F9', borderBottom: '1px solid #E7E5EA' }}>
            {['Asset', 'Tag', 'Category', 'Last Maintenance', 'Next Due', 'Status'].map(h => (
              <th key={h} className="px-4 py-3 text-left" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y" style={{ borderColor: '#F7F7F9' }}>
            {[
              { name: 'MacBook Pro 14"', tag: 'AF-0001', cat: 'Laptops', last: 'Jan 2024', next: 'Jul 2024', status: 'Overdue' },
              { name: 'Toyota Innova', tag: 'AF-0005', cat: 'Vehicles', last: 'Mar 2024', next: 'Sep 2024', status: 'Upcoming' },
              { name: 'Epson Projector', tag: 'AF-0006', cat: 'Conf. Room', last: 'May 2024', next: 'Nov 2024', status: 'Upcoming' },
            ].map(r => (
              <tr key={r.tag} className="hover:bg-slate-50 transition-colors" style={{ height: '56px' }}>
                <td className="px-4 py-3 font-semibold" style={{ color: '#1A1621' }}>{r.name}</td>
                <td className="px-4 py-3"><span className="font-mono text-xs font-semibold px-2 py-1 rounded" style={{ background: '#F0E8ED', color: '#7A3B5E' }}>{r.tag}</span></td>
                <td className="px-4 py-3" style={{ color: '#6B6470' }}>{r.cat}</td>
                <td className="px-4 py-3" style={{ color: '#6B6470' }}>{r.last}</td>
                <td className="px-4 py-3" style={{ color: '#6B6470' }}>{r.next}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
