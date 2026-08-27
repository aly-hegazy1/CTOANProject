import { UrgencyLevel } from '@/lib/referralStore'

const styles: Record<UrgencyLevel, string> = {
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-amber-100 text-amber-700',
  green: 'bg-emerald-100 text-emerald-700',
}

const dots: Record<UrgencyLevel, string> = {
  red: 'bg-red-500',
  yellow: 'bg-amber-500',
  green: 'bg-emerald-500',
}

const labels: Record<UrgencyLevel, string> = {
  red: 'Urgent',
  yellow: 'Semi-Urgent',
  green: 'Routine',
}

export default function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles[level]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[level]}`} />
      {labels[level]}
    </span>
  )
}
