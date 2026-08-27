'use client'

import { useEffect, useState } from 'react'
import { Referral } from '@/lib/referralStore'
import SpecialistQueueItem from '@/app/components/SpecialistQueueItem'

const SPECIALIST_PASSWORD = 'specialist123'

export default function SpecialistDashboard() {
  const [unlocked, setUnlocked] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)

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

  useEffect(() => { if (unlocked) load() }, [unlocked])

  function handleUnlock(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (passwordInput === SPECIALIST_PASSWORD) {
      setUnlocked(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
      setPasswordInput('')
    }
  }

  async function handleAccept(id: string) {
    const name = prompt('Enter your name as assigned specialist:') || 'Dr. Jenkins'
    const res = await fetch(`/api/referrals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'accepted',
        assignedSpecialist: name,
        noteText: `Referral accepted by ${name}.`,
        noteAuthor: name,
      }),
    })
    if (res.ok) {
      setFeedback(`Referral ${id} accepted.`)
      load()
    }
  }

  async function handleSchedule(id: string, date: string) {
    const res = await fetch(`/api/referrals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'scheduled',
        scheduledDate: date,
        noteText: `Appointment scheduled for ${date}.`,
        noteAuthor: 'Specialist',
      }),
    })
    if (res.ok) {
      setFeedback(`Referral ${id} scheduled for ${date}.`)
      load()
    }
  }

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-8 shadow-sm">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--line)] bg-white text-2xl shadow-sm">
                🔒
              </div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Restricted Access</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                Specialist Dashboard
              </h1>
              <p className="mt-2 text-sm text-[var(--muted)]">Enter your specialist access code to continue.</p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                  Access Code
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false) }}
                  placeholder="••••••••••••"
                  autoFocus
                  className={`mt-1.5 w-full rounded-2xl border px-4 py-3 text-sm text-[var(--foreground)] outline-none transition
                    ${passwordError ? 'border-red-400 bg-red-50' : 'border-[var(--line)] bg-white focus:border-amber-400'}`}
                />
                {passwordError && (
                  <p className="mt-1.5 text-xs text-red-600">Incorrect access code. Please try again.</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-[var(--foreground)] py-3 text-sm font-medium text-white shadow-md transition hover:bg-slate-800"
              >
                Unlock Dashboard
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[var(--muted)]">
              Not a specialist?{' '}
              <a href="/gp-dashboard" className="font-medium text-[var(--accent)] hover:underline">
                Go to GP Dashboard →
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  const incoming = referrals.filter((r) => r.status === 'reviewed')
  const accepted = referrals.filter((r) => r.status === 'accepted')
  const scheduled = referrals.filter((r) => r.status === 'scheduled')

  return (
    <div className="min-h-screen px-6 py-8 lg:px-10">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Specialist Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">Incoming Referrals</h1>
          </div>
          <button
            onClick={() => { setUnlocked(false); setPasswordInput('') }}
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            🔒 Lock
          </button>
        </div>
        <div className="mt-3 flex gap-4 text-sm text-[var(--muted)]">
          <span className="font-medium text-amber-600">{incoming.length} awaiting acceptance</span>
          <span>{accepted.length} accepted</span>
          <span className="font-medium text-emerald-600">{scheduled.length} scheduled</span>
        </div>
        {feedback && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            {feedback}
          </div>
        )}
      </header>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading queue…</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            {incoming.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Awaiting Acceptance</h2>
                <div className="space-y-4">
                  {incoming.map((r) => (
                    <SpecialistQueueItem key={r.id} referral={r} onAccept={handleAccept}
                      onSchedule={handleSchedule} onSelect={setSelected} selected={selected?.id === r.id} />
                  ))}
                </div>
              </section>
            )}
            {accepted.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Accepted — Needs Scheduling</h2>
                <div className="space-y-4">
                  {accepted.map((r) => (
                    <SpecialistQueueItem key={r.id} referral={r} onAccept={handleAccept}
                      onSchedule={handleSchedule} onSelect={setSelected} selected={selected?.id === r.id} />
                  ))}
                </div>
              </section>
            )}
            {scheduled.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Scheduled</h2>
                <div className="space-y-4">
                  {scheduled.map((r) => (
                    <SpecialistQueueItem key={r.id} referral={r} onAccept={handleAccept}
                      onSchedule={handleSchedule} onSelect={setSelected} selected={selected?.id === r.id} />
                  ))}
                </div>
              </section>
            )}
            {referrals.filter((r) => r.status !== 'submitted').length === 0 && (
              <p className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-10 text-center text-sm text-[var(--muted)]">
                No referrals have been approved by a GP yet.
              </p>
            )}
          </div>

          {selected && (
            <aside className="sticky top-6 self-start rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--foreground)]">Referral Details</h3>
                <button onClick={() => setSelected(null)} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">✕</button>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <Row label="Patient" value={selected.patientName} />
                <Row label="Specialist type" value={selected.specialistType} />
                <Row label="Body part" value={selected.bodyPart} />
                <Row label="Symptoms" value={selected.symptoms} />
                <Row label="Duration" value={selected.duration} />
                <Row label="Pain" value={`${selected.painLevel}/10`} />
                <div className="rounded-xl border border-[var(--line)] bg-white p-3">
                  <p className="mb-1 font-medium text-[var(--foreground)]">Clinical Summary</p>
                  <p className="text-xs leading-5 text-[var(--muted)]">{selected.summary}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-amber-900">Referral Letter</p>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-5 text-amber-950/80">{selected.referralLetter}</pre>
                </div>
                {selected.notes.map((n, i) => (
                  <div key={i} className="rounded-lg border border-[var(--line)] bg-white p-2 text-xs">
                    <span className="font-medium">{n.author}:</span> {n.text}
                  </div>
                ))}
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
