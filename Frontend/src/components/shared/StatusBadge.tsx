import { cn } from '@/lib/utils'
import type { AssetStatus, Priority, MaintenanceStatus, BookingStatus, TransferStatus, CheckStatus } from '@/types'

type StatusType = AssetStatus | Priority | MaintenanceStatus | BookingStatus | TransferStatus | CheckStatus | 'Active' | 'Inactive' | 'Overdue' | 'Returned' | 'Draft' | 'Completed'

const statusConfig: Record<string, { label: string; className: string }> = {
  // Asset status
  Available:        { label: 'Available',         className: 'bg-[#E5F7EC] text-[#0F9D58] border-[#B2E6C8]' },
  Allocated:        { label: 'Allocated',          className: 'bg-[#EAF1FE] text-[#2563EB] border-[#BFCFFD]' },
  Reserved:         { label: 'Reserved',           className: 'bg-[#FEF3E2] text-[#D97706] border-[#FCD9A0]' },
  UnderMaintenance: { label: 'Under Maintenance',  className: 'bg-orange-50 text-orange-600 border-orange-200' },
  Lost:             { label: 'Lost',               className: 'bg-[#FBEAE8] text-[#C0392B] border-[#F0B8B3]' },
  Retired:          { label: 'Retired',            className: 'bg-[#F0E8ED] text-[#7A3B5E] border-[#D8B8CA]' },
  Disposed:         { label: 'Disposed',           className: 'bg-gray-100 text-gray-500 border-gray-200' },
  // Priority
  Critical:         { label: 'Critical',           className: 'bg-[#FBEAE8] text-[#C0392B] border-[#F0B8B3]' },
  High:             { label: 'High',               className: 'bg-orange-50 text-orange-600 border-orange-200' },
  Medium:           { label: 'Medium',             className: 'bg-[#FEF3E2] text-[#D97706] border-[#FCD9A0]' },
  Low:              { label: 'Low',                className: 'bg-[#E5F7EC] text-[#0F9D58] border-[#B2E6C8]' },
  // Maintenance
  Pending:          { label: 'Pending',            className: 'bg-[#FEF3E2] text-[#D97706] border-[#FCD9A0]' },
  Approved:         { label: 'Approved',           className: 'bg-[#EAF1FE] text-[#2563EB] border-[#BFCFFD]' },
  Assigned:         { label: 'Assigned',           className: 'bg-[#F0E8ED] text-[#7A3B5E] border-[#D8B8CA]' },
  InProgress:       { label: 'In Progress',        className: 'bg-[#E5F5F4] text-[#0F8B7F] border-[#9FD6D2]' },
  Resolved:         { label: 'Resolved',           className: 'bg-[#E5F7EC] text-[#0F9D58] border-[#B2E6C8]' },
  Rejected:         { label: 'Rejected',           className: 'bg-[#FBEAE8] text-[#C0392B] border-[#F0B8B3]' },
  // Booking
  Upcoming:         { label: 'Upcoming',           className: 'bg-[#F0E8ED] text-[#7A3B5E] border-[#D8B8CA]' },
  Ongoing:          { label: 'Ongoing',            className: 'bg-[#E5F5F4] text-[#0F8B7F] border-[#9FD6D2]' },
  Completed:        { label: 'Completed',          className: 'bg-gray-100 text-gray-500 border-gray-200' },
  Cancelled:        { label: 'Cancelled',          className: 'bg-[#FBEAE8] text-[#C0392B] border-[#F0B8B3]' },
  // Transfer
  Requested:        { label: 'Requested',          className: 'bg-[#FEF3E2] text-[#D97706] border-[#FCD9A0]' },
  Reallocated:      { label: 'Re-allocated',       className: 'bg-[#E5F7EC] text-[#0F9D58] border-[#B2E6C8]' },
  // Audit
  Verified:         { label: 'Verified',           className: 'bg-[#E5F7EC] text-[#0F9D58] border-[#B2E6C8]' },
  Missing:          { label: 'Missing',            className: 'bg-[#FBEAE8] text-[#C0392B] border-[#F0B8B3]' },
  Damaged:          { label: 'Damaged',            className: 'bg-orange-50 text-orange-600 border-orange-200' },
  // General
  Active:           { label: 'Active',             className: 'bg-[#E5F7EC] text-[#0F9D58] border-[#B2E6C8]' },
  Inactive:         { label: 'Inactive',           className: 'bg-gray-100 text-gray-500 border-gray-200' },
  Overdue:          { label: 'Overdue',            className: 'bg-[#FBEAE8] text-[#C0392B] border-[#F0B8B3]' },
  Returned:         { label: 'Returned',           className: 'bg-gray-100 text-gray-500 border-gray-200' },
  Draft:            { label: 'Draft',              className: 'bg-gray-100 text-gray-500 border-gray-200' },
  // Roles
  Admin:            { label: 'Admin',              className: 'bg-[#F0E8ED] text-[#7A3B5E] border-[#D8B8CA]' },
  AssetManager:     { label: 'Asset Manager',      className: 'bg-[#EAF1FE] text-[#2563EB] border-[#BFCFFD]' },
  DeptHead:         { label: 'Dept Head',          className: 'bg-[#FEF3E2] text-[#D97706] border-[#FCD9A0]' },
  Employee:         { label: 'Employee',           className: 'bg-gray-100 text-[#6B6470] border-gray-200' },
  // Condition
  Good:             { label: 'Good',               className: 'bg-[#E5F7EC] text-[#0F9D58] border-[#B2E6C8]' },
  Fair:             { label: 'Fair',               className: 'bg-[#FEF3E2] text-[#D97706] border-[#FCD9A0]' },
  Poor:             { label: 'Poor',               className: 'bg-orange-50 text-orange-600 border-orange-200' },
}

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-600 uppercase tracking-wide border', config.className, className)}>
      {config.label}
    </span>
  )
}
