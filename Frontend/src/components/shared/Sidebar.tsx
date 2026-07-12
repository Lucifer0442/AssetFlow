import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Package, ArrowRightLeft, CalendarDays,
  Wrench, ClipboardList, BarChart3, Bell, ChevronLeft, ChevronRight,
  Settings, HelpCircle, Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import type { Role } from '@/types'

interface NavItem { label: string; href: string; icon: React.ElementType; roles: Role[] }
interface NavGroup { label: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'AssetManager', 'DeptHead', 'Employee'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Org Setup', href: '/org', icon: Building2, roles: ['Admin'] },
    ],
  },
  {
    label: 'Asset Management',
    items: [
      { label: 'Asset Registry', href: '/assets', icon: Package, roles: ['Admin', 'AssetManager', 'DeptHead', 'Employee'] },
      { label: 'Allocations', href: '/allocations', icon: ArrowRightLeft, roles: ['Admin', 'AssetManager', 'DeptHead', 'Employee'] },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Bookings', href: '/bookings', icon: CalendarDays, roles: ['Admin', 'AssetManager', 'DeptHead', 'Employee'] },
      { label: 'Maintenance', href: '/maintenance', icon: Wrench, roles: ['Admin', 'AssetManager', 'DeptHead', 'Employee'] },
    ],
  },
  {
    label: 'Governance',
    items: [
      { label: 'Audits', href: '/audits', icon: ClipboardList, roles: ['Admin', 'AssetManager'] },
      { label: 'Reports', href: '/reports', icon: BarChart3, roles: ['Admin', 'AssetManager', 'DeptHead'] },
      { label: 'Notifications', href: '/notifications', icon: Bell, roles: ['Admin', 'AssetManager', 'DeptHead', 'Employee'] },
    ],
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()
  const location = useLocation()

  const visibleGroups = navGroups
    .map(g => ({ ...g, items: g.items.filter(i => user && i.roles.includes(user.role)) }))
    .filter(g => g.items.length > 0)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen flex flex-col z-40 transition-[width] duration-300 ease-in-out',
        'border-r border-[#5A2E4A]',
        collapsed ? 'w-16' : 'w-[240px]'
      )}
      style={{ background: '#3D1F35' }}
    >
      {/* Logo block */}
      <div className={cn('flex items-center px-4 py-5', collapsed && 'justify-center px-2')}>
        {collapsed ? (
          <span className="text-white font-bold text-base tracking-tight">AF</span>
        ) : (
          <div>
            <span className="text-white font-bold text-sm tracking-tight">AssetFlow</span>
            <span className="block text-[9px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: '#9C7A8A' }}>Enterprise Resource</span>
          </div>
        )}
      </div>

      {/* Quick action CTA */}
      {!collapsed && (
        <div className="px-3 pb-4">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:brightness-110" style={{ background: '#7A3B5E' }}>
            <Plus className="w-4 h-4" /> Quick Action
          </button>
        </div>
      )}

      {/* Separator */}
      <div className="h-px mx-3 mb-3" style={{ background: '#5A2E4A' }} />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 py-1">
        {visibleGroups.map(group => (
          <div key={group.label} className="mb-3">
            {!collapsed && (
              <p className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: '#9C7A8A' }}>
                {group.label}
              </p>
            )}
            {group.items.map(item => {
              const active = location.pathname.startsWith(item.href)
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all relative group mb-0.5',
                    collapsed && 'justify-center',
                    active
                      ? 'text-white'
                      : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                  )}
                  style={active ? { background: '#7A3B5E' } : {}}
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.8} />
                  {!collapsed && <span className="text-[13px]">{item.label}</span>}
                  {/* Collapsed tooltip */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl text-white" style={{ background: '#2A1826' }}>
                      {item.label}
                    </div>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom pinned */}
      <div className="px-2 pb-4 space-y-0.5">
        <div className="h-px mb-3" style={{ background: '#5A2E4A' }} />
        {[{ label: 'Settings', icon: Settings, href: '/settings' }, { label: 'Support', icon: HelpCircle, href: '/support' }].map(b => (
          <NavLink
            key={b.href}
            to={b.href}
            className={cn('flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all text-white/50 hover:text-white/80 hover:bg-white/5', collapsed && 'justify-center')}
          >
            <b.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.8} />
            {!collapsed && <span className="text-[13px]">{b.label}</span>}
          </NavLink>
        ))}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn('w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all mt-1', collapsed && 'justify-center')}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span className="text-[12px]">Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}
