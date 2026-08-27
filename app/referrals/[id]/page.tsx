'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Referral } from '@/lib/referralStore'
import StatusTracker from '@/app/components/StatusTracker'
import UrgencyBadge from '@/app/components/UrgencyBadge'

export default function ReferralDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const [referral, setReferral] = useState<Referral | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/referrals')
      .then((r) => r.json())
      .then((data) => {
        const found = (data.referrals as Referral[]).find((r) => r.id === id)
        if (!found) setError('Referral not found.')
        else setReferral(found)
      })
      .catch(() => setError('Failed to load referral.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-[var(--muted)]">Loading…</div>
  }

  if (error || !referral) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-[var(--muted)]">{error ?? 'Referral not found.'}</p>
        <a href="/" className="text-sm font-medium text-[var(--accent)] underline">← Home</a>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Referral {referral.id}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{referral.patientName}</h1>
        </div>
        <UrgencyBadge level={referral.urgencyLevel} />
      </div>

      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-6 shadow-sm">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Referral Status</h2>
        <StatusTracker status={referral.status} assignedSpecialist={referral.assignedSpecialist} scheduledDate={referral.scheduledDate} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Referred To</p>
          <p className="mt-1 font-semibold text-[var(--foreground)]">{referral.specialistType}</p>
        </div>
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Submitted</p>
          <p className="mt-1 font-semibold text-[var(--foreground)]">{new Date(referral.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Affected Area</p>
          <p className="mt-1 font-semibold capitalize text-[var(--foreground)]">{referral.bodyPart}</p>
        </div>
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Pain Level</p>
          <p className="mt-1 font-semibold text-[var(--foreground)]">{referral.painLevel}/10</p>
        </div>
      </div>

      <div className="mt-4 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Clinical Summary</p>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{referral.summary}</p>
      </div>

      <div className="mt-4 rounded-[2rem] border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-amber-900">Referral Letter</p>
        <pre className="whitespace-pre-wrap font-sans text-xs leading-6 text-amber-950/80">{referral.referralLetter}</pre>
      </div>

      {referral.notes.length > 0 && (
        <div className="mt-4 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-5 shadow-sm">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Clinical Notes</p>
          <div className="space-y-2">
            {referral.notes.map((n, i) => (
              <div key={i} className="rounded-xl border border-[var(--line)] bg-white p-3 text-sm">
                <span className="font-medium text-[var(--foreground)]">{n.author}</span>
                <span className="ml-2 text-xs text-[var(--muted)]">{n.timestamp}</span>
                <p className="mt-1 text-[var(--muted)]">{n.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <a href="/gp-dashboard" className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-slate-50">
          ← GP Dashboard
        </a>
        <a href="/specialist-dashboard" className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-slate-50">
          Specialist Dashboard →
        </a>
      </div>
    </div>
  )
}
