import { useState, type ReactNode } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  className?: string
  render?: (row: T) => ReactNode
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[]
  data: T[]
  pageSize?: number
  onRowClick?: (row: T) => void
  emptyState?: ReactNode
  className?: string
}

export function DataTable<T extends { id: string }>({
  columns, data, pageSize = 10, onRowClick, emptyState, className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const av = (a as Record<string, unknown>)[sortKey]
    const bv = (b as Record<string, unknown>)[sortKey]
    const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  return (
    <div className={cn('', className)}>
      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #E7E5EA' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#F7F7F9', borderBottom: '1px solid #E7E5EA' }}>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  onClick={() => handleSort(String(col.key), col.sortable)}
                  className={cn('px-4 py-3 text-left whitespace-nowrap', col.sortable && 'cursor-pointer select-none', col.className)}
                  style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470' }}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="flex flex-col">
                        <ChevronUp className={cn('w-3 h-3 -mb-0.5')} style={{ color: sortKey === String(col.key) && sortDir === 'asc' ? '#7A3B5E' : '#E7E5EA' }} />
                        <ChevronDown className="w-3 h-3" style={{ color: sortKey === String(col.key) && sortDir === 'desc' ? '#7A3B5E' : '#E7E5EA' }} />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-sm" style={{ color: '#9C97A3' }}>
                  {emptyState ?? 'No data found.'}
                </td>
              </tr>
            ) : paged.map((row, i) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn('bg-white hover:bg-slate-50 transition-colors', onRowClick && 'cursor-pointer')}
                style={{ borderBottom: i < paged.length - 1 ? '1px solid #F7F7F9' : 'none', height: '56px' }}
              >
                {columns.map(col => (
                  <td key={String(col.key)} className={cn('px-4 py-3', col.className)} style={{ color: '#6B6470', fontSize: '14px' }}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[String(col.key)] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <p className="text-xs" style={{ color: '#9C97A3' }}>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data.length)} of {data.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" style={{ color: '#6B6470' }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                style={page === p ? { background: '#7A3B5E', color: 'white' } : { color: '#6B6470' }}
                onMouseEnter={e => { if (page !== p) e.currentTarget.style.background = '#F0E8ED' }}
                onMouseLeave={e => { if (page !== p) e.currentTarget.style.background = '' }}
              >{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed" style={{ color: '#6B6470' }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
