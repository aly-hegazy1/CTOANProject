'use client'

import { useEffect, useState } from 'react'
import { Referral, ReferralStatus } from '@/lib/referralStore'
import UrgencyBadge from '@/app/components/UrgencyBadge'

const PASSWORD = '123'

const STATUS_LABELS: Record<ReferralStatus, string> = {
  submitted: 'Awaiting Review',
  reviewed: 'Reviewed — Needs Appointment',
  appointment_made: 'Appointment Made',
  prescription_prescribed: 'Complete',
}

export default function SpecialistDashboard() {
  const [unlocked, setUnlocked] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)

  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [selected, setSelected] = useState<Referral | null>(null)

  async function load() {
    const res = await fetch('/api/referrals')
    const data = await res.json()
    setReferrals(data.referrals)
    setLoading(false)
  }

  useEffect(() => { if (unlocked) load() }, [unlocked])

  function handleUnlock(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (passwordInput === PASSWORD) {
      setUnlocked(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
      setPasswordInput('')
    }
  }

  async function updateStatus(id: string, status: ReferralStatus, noteText: string) {
    const res = await fetch(`/api/referrals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, noteText, noteAuthor: 'Specialist' }),
    })
    if (res.ok) {
      setFeedback(`Updated → ${STATUS_LABELS[status]}`)
      await load()
      if (selected?.id === id) {
        const updated = await fetch(`/api/referrals/${id}`).then(r => r.json())
        setSelected(updated.referral)
      }
    }
  }

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-8 shadow-sm">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--line)] bg-white text-2xl shadow-sm">🔒</div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Restricted Access</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">Specialist Login</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">Enter your access code to continue.</p>
            </div>
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Access Code</label>
                <input type="password" value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false) }}
                  placeholder="••••" autoFocus
                  className={`mt-1.5 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition
                    ${passwordError ? 'border-red-400 bg-red-50' : 'border-[var(--line)] bg-white focus:border-amber-400'}`} />
                {passwordError && <p className="mt-1.5 text-xs text-red-600">Incorrect code. Try again.</p>}
              </div>
              <button type="submit"
                className="w-full rounded-full bg-[var(--foreground)] py-3 text-sm font-medium text-white shadow-md transition hover:bg-slate-800">
                Unlock Dashboard
              </button>
            </form>
            <p className="mt-6 text-center text-xs text-[var(--muted)]">
              Not a specialist?{' '}
              <a href="/" className="font-medium text-[var(--accent)] hover:underline">← Home</a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-8 lg:px-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Specialist Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">Patient Intake Forms</h1>
        </div>
        <button onClick={() => { setUnlocked(false); setPasswordInput('') }}
          className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
          🔒 Lock
        </button>
      </header>

      {feedback && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{feedback}</div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            {referrals.length === 0 && (
              <p className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-10 text-center text-sm text-[var(--muted)]">
                No intake forms submitted yet.
              </p>
            )}
            {referrals.map((r) => (
              <div key={r.id} onClick={() => setSelected(r)}
                className={`cursor-pointer rounded-[2rem] border bg-[var(--surface)]/90 p-5 shadow-sm transition
                  ${selected?.id === r.id ? 'border-[var(--accent)]' : 'border-[var(--line)] hover:border-amber-300'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">{r.patientName}</p>
                    <p className="mt-0.5 text-sm text-[var(--muted)]">{r.specialistType} · {r.bodyPart} · {r.duration}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--muted)]">ID: {r.id}</p>
                  </div>
                  <UrgencyBadge level={r.urgencyLevel} />
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{r.summary}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {r.status === 'submitted' && (
                    <button onClick={() => updateStatus(r.id, 'reviewed', 'Intake form reviewed by specialist.')}
                      className="rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700">
                      ✓ Mark as Reviewed
                    </button>
                  )}
                  {r.status === 'reviewed' && (
                    <button onClick={() => updateStatus(r.id, 'appointment_made', 'Appointment scheduled.')}
                      className="rounded-full bg-amber-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-amber-700">
                      📅 Appointment Made
                    </button>
                  )}
                  {r.status === 'appointment_made' && (
                    <button onClick={() => updateStatus(r.id, 'prescription_prescribed', 'Prescription issued.')}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-700">
                      💊 Prescription Prescribed
                    </button>
                  )}
                  <span className={`rounded-full border px-3 py-1.5 text-xs font-medium
                    ${r.status === 'submitted' ? 'border-slate-200 bg-slate-50 text-slate-600'
                    : r.status === 'reviewed' ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : r.status === 'appointment_made' ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <aside className="sticky top-6 self-start rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--foreground)]">Intake Details</h3>
                <button onClick={() => setSelected(null)} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">✕</button>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <Row label="Patient" value={selected.patientName} />
                <Row label="Specialist" value={selected.specialistType} />
                <Row label="Body part" value={selected.bodyPart} />
                <Row label="Symptoms" value={selected.symptoms} />
                <Row label="Duration" value={selected.duration} />
                <Row label="Pain" value={`${selected.painLevel}/10`} />
                <div className="rounded-xl border border-[var(--line)] bg-white p-3">
                  <p className="mb-1 font-medium text-[var(--foreground)]">Clinical Summary</p>
                  <p className="text-xs leading-5 text-[var(--muted)]">{selected.summary}</p>
                </div>
                <div className="rounded-xl border border-[var(--line)] bg-white p-3">
                  <p className="mb-1 font-medium text-[var(--foreground)]">Patient&apos;s Description</p>
                  <p className="text-xs leading-5 text-[var(--muted)]">{selected.intakeText}</p>
                </div>
                {selected.notes.map((n, i) => (
                  <div key={i} className="rounded-lg border border-[var(--line)] bg-white p-2 text-xs">
                    <span className="font-medium">{n.author}:</span> {n.text}
                    <span className="ml-2 text-[var(--muted)]">{n.timestamp}</span>
                  </div>
                ))}
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
