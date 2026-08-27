import { Referral } from '@/lib/referralStore'
import UrgencyBadge from './UrgencyBadge'

interface ReferralCardProps {
  referral: Referral
  onApprove: (id: string) => void
  onSelect: (referral: Referral) => void
  selected?: boolean
}

export default function ReferralCard({ referral, onApprove, onSelect, selected }: ReferralCardProps) {
  const canApprove = referral.status === 'submitted'

  return (
    <div
      className={`cursor-pointer rounded-[2rem] border bg-[var(--surface)]/90 p-5 shadow-sm transition
        ${selected ? 'border-[var(--accent)]' : 'border-[var(--line)] hover:border-amber-300'}`}
      onClick={() => onSelect(referral)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--foreground)]">{referral.patientName}</p>
          <p className="mt-0.5 text-sm text-[var(--muted)]">{referral.specialistType} · {referral.bodyPart} · {referral.duration}</p>
        </div>
        <UrgencyBadge level={referral.urgencyLevel} />
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{referral.summary}</p>
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onApprove(referral.id) }}
          disabled={!canApprove}
          className="rounded-full bg-[var(--foreground)] px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-800 disabled:opacity-40"
        >
          {canApprove ? 'Approve & Forward' : `Status: ${referral.status}`}
        </button>
        <a
          href={`/referrals/${referral.id}`}
          onClick={(e) => e.stopPropagation()}
          className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-slate-50"
        >
          Track →
        </a>
      </div>
    </div>
  )
}
