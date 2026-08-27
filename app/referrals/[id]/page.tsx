'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Referral } from '@/lib/referralStore'
import StatusTracker from '@/app/components/StatusTracker'

export default function ReferralDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const [referral, setReferral] = useState<Referral | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/referrals/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setReferral(data.referral)
      })
      .catch(() => setError('Failed to load referral.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">Loading…</div>
  }

  if (error || !referral) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <p className="text-sm text-[var(--muted)]">{error ?? 'Referral not found.'}</p>
        <a href="/tracker" className="text-sm font-medium text-[var(--accent)] underline">← Try another ID</a>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Referral Status</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{referral.patientName}</h1>
        <p className="mt-1 font-mono text-sm text-[var(--muted)]">{referral.id}</p>
      </div>

      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-8 shadow-sm">
        <StatusTracker status={referral.status} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Specialist Type</p>
          <p className="mt-1 font-semibold text-[var(--foreground)]">{referral.specialistType}</p>
        </div>
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Submitted</p>
          <p className="mt-1 font-semibold text-[var(--foreground)]">{new Date(referral.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {referral.notes.length > 0 && (
        <div className="mt-4 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-5 shadow-sm">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Updates from Specialist</p>
          <div className="space-y-2">
            {referral.notes.map((n, i) => (
              <div key={i} className="rounded-xl border border-[var(--line)] bg-white p-3 text-sm">
                <p className="text-[var(--muted)]">{n.text}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{n.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <a href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">← Back to home</a>
      </div>
    </div>
  )
}
