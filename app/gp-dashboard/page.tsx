'use client'

import { useEffect, useState } from 'react'
import { Referral } from '@/lib/referralStore'
import ReferralCard from '@/app/components/ReferralCard'

export default function GPDashboard() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Referral | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/referrals')
    const data = await res.json()
    setReferrals(data.referrals)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleApprove(id: string) {
    const res = await fetch(`/api/referrals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'reviewed',
        noteText: 'Reviewed and approved by GP.',
        noteAuthor: 'Dr. Vance (GP)',
      }),
    })
    if (res.ok) {
      setFeedback(`Referral ${id} approved and forwarded to specialist queue.`)
      load()
    }
  }

  const pending = referrals.filter((r) => r.status === 'submitted')
  const processed = referrals.filter((r) => r.status !== 'submitted')

  return (
    <div className="min-h-screen px-6 py-8 lg:px-10">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">GP Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">Referral Queue</h1>
          </div>
          <a href="/intake" className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-slate-50">
            + New Intake
          </a>
        </div>
        <div className="mt-3 flex gap-4 text-sm text-[var(--muted)]">
          <span className="font-medium text-red-600">{pending.length} pending review</span>
          <span>{processed.length} processed</span>
        </div>
        {feedback && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            {feedback}
          </div>
        )}
      </header>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading referrals…</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            {pending.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Pending Review</h2>
                <div className="space-y-4">
                  {pending.map((r) => (
                    <ReferralCard key={r.id} referral={r} onApprove={handleApprove}
                      onSelect={setSelected} selected={selected?.id === r.id} />
                  ))}
                </div>
              </section>
            )}
            {processed.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Processed</h2>
                <div className="space-y-4">
                  {processed.map((r) => (
                    <ReferralCard key={r.id} referral={r} onApprove={handleApprove}
                      onSelect={setSelected} selected={selected?.id === r.id} />
                  ))}
                </div>
              </section>
            )}
            {referrals.length === 0 && (
              <p className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-10 text-center text-sm text-[var(--muted)]">
                No referrals yet. <a href="/intake" className="font-medium text-[var(--accent)] underline">Create one →</a>
              </p>
            )}
          </div>

          {selected && (
            <aside className="sticky top-6 self-start rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--foreground)]">Details</h3>
                <button onClick={() => setSelected(null)} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">✕</button>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <Row label="Patient" value={selected.patientName} />
                <Row label="Email" value={selected.patientEmail} />
                <Row label="Body part" value={selected.bodyPart} />
                <Row label="Symptoms" value={selected.symptoms} />
                <Row label="Duration" value={selected.duration} />
                <Row label="Pain" value={`${selected.painLevel}/10`} />
                <Row label="Summary" value={selected.summary} />
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-amber-900">Referral Letter</p>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-5 text-amber-950/80">{selected.referralLetter}</pre>
                </div>
                {selected.notes.length > 0 && (
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Notes</p>
                    {selected.notes.map((n, i) => (
                      <div key={i} className="mt-1 rounded-lg border border-[var(--line)] bg-white p-2 text-xs">
                        <span className="font-medium">{n.author}:</span> {n.text}
                      </div>
                    ))}
                  </div>
                )}
                <a href={`/referrals/${selected.id}`}
                  className="block rounded-full border border-[var(--line)] bg-white px-4 py-2 text-center text-xs font-medium text-[var(--foreground)] hover:bg-slate-50">
                  Open Status Page →
                </a>
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-medium text-[var(--foreground)]">{label}: </span>
      <span className="text-[var(--muted)]">{value}</span>
    </div>
  )
}
