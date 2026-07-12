import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  label: string
  value: number | string
  icon: LucideIcon
  iconBg?: string
  iconColor?: string
  trend?: { value: number; label: string }
  alert?: string
  className?: string
}

export function KPICard({ label, value, icon: Icon, iconBg = '#F0E8ED', iconColor = '#7A3B5E', trend, alert, className }: KPICardProps) {
  return (
    <div className={cn('bg-white rounded-2xl p-5 hover:shadow-md transition-shadow', className)} style={{ border: '1px solid #E7E5EA' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Eyebrow label */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: '#6B6470' }}>{label}</p>
          {/* Big stat */}
          <p className="mt-1.5 text-[32px] font-bold leading-none tabular-nums" style={{ color: '#1A1621' }}>
            {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </p>
          {/* Trend or alert */}
          {trend && (
            <p className="mt-2 text-[12px] font-medium" style={{ color: trend.value >= 0 ? '#0F9D58' : '#C0392B' }}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
          {alert && (
            <p className="mt-2 text-[12px] font-medium" style={{ color: '#C0392B' }}>
              ⚠ {alert}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
          <Icon className="w-5 h-5" style={{ color: iconColor }} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  )
}
