'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TrackerPage() {
  const [referralId, setReferralId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = referralId.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')

    const res = await fetch(`/api/referrals/${trimmed}`)
    setLoading(false)

    if (res.ok) {
      router.push(`/referrals/${trimmed}`)
    } else {
      setError('No referral found with that ID. Please check and try again.')
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-12%] h-80 w-80 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="absolute right-[-12%] top-16 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-8 shadow-sm">
          <div className="text-center">
            <span className="text-4xl">📍</span>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
              Track Your Referral
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Enter the tracking ID you received after submitting your intake form.
            </p>
          </div>

          <form onSubmit={handleLookup} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                Referral ID
              </label>
              <input
                type="text"
                value={referralId}
                onChange={(e) => { setReferralId(e.target.value); setError('') }}
                placeholder="e.g. ref-342"
                autoFocus
                className={`mt-1.5 w-full rounded-2xl border px-4 py-3 text-sm font-mono text-[var(--foreground)] outline-none transition
                  ${error ? 'border-red-400 bg-red-50' : 'border-[var(--line)] bg-white focus:border-amber-400'}`}
              />
              {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={loading || !referralId.trim()}
              className="w-full rounded-full bg-[var(--foreground)] py-3 text-sm font-medium text-white shadow-md transition hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? 'Looking up…' : 'Check Status'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--muted)]">
            Haven't submitted yet?{' '}
            <a href="/intake" className="font-medium text-[var(--accent)] hover:underline">
              Fill in the intake form →
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
