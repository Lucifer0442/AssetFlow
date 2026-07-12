import { AlertTriangle, ArrowRightLeft } from 'lucide-react'

interface ConflictAlertProps {
  holderName: string
  assetName: string
  onRequestTransfer: () => void
}

export function ConflictAlert({ holderName, assetName, onRequestTransfer }: ConflictAlertProps) {
  return (
    <div className="rounded-xl p-4" style={{ background: '#FEF3E2', border: '1px solid #FCD9A0' }}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg flex-shrink-0" style={{ background: '#FBEAE8' }}>
          <AlertTriangle className="w-4 h-4" style={{ color: '#D97706' }} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm" style={{ color: '#92400E' }}>Asset Not Available</h4>
          <p className="mt-0.5 text-sm" style={{ color: '#B45309' }}>
            <span className="font-semibold">{assetName}</span> is currently held by{' '}
            <span className="font-semibold">{holderName}</span>.
          </p>
          <p className="mt-1 text-xs" style={{ color: '#D97706' }}>
            You cannot directly allocate this asset. Raise a transfer request instead.
          </p>
          <button
            onClick={onRequestTransfer}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-90"
            style={{ background: '#7A3B5E' }}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Request Transfer →
          </button>
        </div>
      </div>
    </div>
  )
}
