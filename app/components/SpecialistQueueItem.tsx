import { Referral } from '@/lib/referralStore'
import UrgencyBadge from './UrgencyBadge'

interface SpecialistQueueItemProps {
  referral: Referral
  onAccept: (id: string) => void
  onSchedule: (id: string, date: string) => void
  onSelect: (referral: Referral) => void
  selected?: boolean
}

export default function SpecialistQueueItem({
  referral, onAccept, onSchedule, onSelect, selected,
}: SpecialistQueueItemProps) {
  const canAccept = referral.status === 'reviewed'
  const canSchedule = referral.status === 'accepted'

  function handleScheduleClick(e: React.MouseEvent) {
    e.stopPropagation()
    const date = prompt('Enter appointment date (e.g. 2026-09-15 at 10:00 AM):')
    if (date) onSchedule(referral.id, date)
  }

  return (
    <div
      className={`cursor-pointer rounded-[2rem] border bg-[var(--surface)]/90 p-5 shadow-sm transition
        ${selected ? 'border-[var(--accent)]' : 'border-[var(--line)] hover:border-amber-300'}`}
      onClick={() => onSelect(referral)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--foreground)]">{referral.patientName}</p>
          <p className="mt-0.5 text-sm text-[var(--muted)]">{referral.specialistType} · {referral.bodyPart}</p>
        </div>
        <UrgencyBadge level={referral.urgencyLevel} />
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{referral.summary}</p>
      {referral.assignedSpecialist && (
        <p className="mt-2 text-xs text-[var(--muted)]">Assigned: {referral.assignedSpecialist}</p>
      )}
      {referral.scheduledDate && (
        <p className="mt-1 text-xs font-medium text-emerald-700">Scheduled: {referral.scheduledDate}</p>
      )}
      <div className="mt-4 flex items-center gap-2">
        {canAccept && (
          <button
            onClick={(e) => { e.stopPropagation(); onAccept(referral.id) }}
            className="rounded-full bg-[var(--foreground)] px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
          >
            Accept Referral
          </button>
        )}
        {canSchedule && (
          <button onClick={handleScheduleClick}
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-medium text-white transition hover:bg-amber-600">
            Schedule Appointment
          </button>
        )}
        {!canAccept && !canSchedule && (
          <span className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-medium capitalize text-[var(--muted)]">
            {referral.status}
          </span>
        )}
        <a href={`/referrals/${referral.id}`} onClick={(e) => e.stopPropagation()}
          className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-slate-50">
          Track →
        </a>
      </div>
    </div>
  )
}
