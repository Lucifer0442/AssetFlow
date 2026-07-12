import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  footer?: ReactNode
}

const sizeMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }

export function Modal({ open, onClose, title, children, size = 'md', footer }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-2xl w-full flex flex-col max-h-[90vh]', sizeMap[size])} style={{ border: '1px solid #E7E5EA', boxShadow: '0 24px 60px rgba(0,0,0,0.16)' }}>
        {/* Top accent bar */}
        <div className="h-1 rounded-t-2xl" style={{ background: '#7A3B5E' }} />
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #E7E5EA' }}>
          <h2 className="text-[18px] font-semibold" style={{ color: '#1A1621' }}>{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: '#9C97A3' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 flex justify-end gap-2" style={{ borderTop: '1px solid #E7E5EA' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// Reusable button styles for modals
export function ModalCancelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-4 py-2 text-sm font-medium rounded-xl border transition-all hover:bg-slate-50" style={{ borderColor: '#E7E5EA', color: '#6B6470' }}>
      Cancel
    </button>
  )
}
export function ModalSubmitBtn({ onClick, label = 'Confirm →' }: { onClick?: () => void; label?: string }) {
  return (
    <button onClick={onClick} type="submit" className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:brightness-90" style={{ background: '#7A3B5E' }}>
      {label}
    </button>
  )
}
