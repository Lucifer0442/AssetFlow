import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SlideOverPanelProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  width?: 'md' | 'lg' | 'xl'
}

const widthMap = { md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }

export function SlideOverPanel({ open, onClose, title, subtitle, children, width = 'lg' }: SlideOverPanelProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div className={cn('fixed inset-0 z-50', open ? 'pointer-events-auto' : 'pointer-events-none')}>
      <div
        className={cn('absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
      />
      <div className={cn('absolute inset-y-0 right-0 flex flex-col bg-white transition-transform duration-300 w-full', widthMap[width], open ? 'translate-x-0' : 'translate-x-full')} style={{ boxShadow: '-8px 0 40px rgba(0,0,0,0.1)' }}>
        {/* Top accent */}
        <div className="h-1 flex-shrink-0" style={{ background: '#7A3B5E' }} />
        <div className="flex items-start justify-between px-6 py-5" style={{ borderBottom: '1px solid #E7E5EA' }}>
          <div>
            <h2 className="text-[18px] font-semibold" style={{ color: '#1A1621' }}>{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm" style={{ color: '#9C97A3' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors mt-0.5" style={{ color: '#9C97A3' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
