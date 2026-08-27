'use client'

import { useState } from 'react'
import SymptomBodyPicker from './SymptomBodyPicker'

type TriageResult = {
  urgencyLevel: 'red' | 'yellow' | 'green'
  specialistType: string
  summary: string
  referralLetter: string
  rationale: string
}

export default function IntakeForm() {
  const [patientName, setPatientName] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [bodyPart, setBodyPart] = useState('knee')
  const [symptoms, setSymptoms] = useState('')
  const [duration, setDuration] = useState('')
  const [painLevel, setPainLevel] = useState('5')
  const [intakeText, setIntakeText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [triage, setTriage] = useState<TriageResult | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)

  async function handleAnalyze(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!intakeText.trim()) {
      setFeedback('Please enter a clinical narrative before running triage.')
      return
    }
    setIsAnalyzing(true)
    setFeedback(null)
    setSuccessId(null)
    try {
      const res = await fetch('/api/gemini/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intakeText, bodyPart, symptoms, duration, painLevel }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Triage failed')
      setTriage(data.triage)
      setFeedback('AI triage complete.')
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Error running triage')
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function handleSubmit() {
    if (!triage) return
    setIsSubmitting(true)
    setFeedback(null)
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patientName || 'Anonymous Patient',
          patientEmail,
          bodyPart,
          symptoms,
          duration,
          painLevel,
          intakeText,
          urgencyLevel: triage.urgencyLevel,
          specialistType: triage.specialistType,
          summary: triage.summary,
          referralLetter: triage.referralLetter,
          rationale: triage.rationale,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSuccessId(data.referral.id)
      setFeedback(`Referral ${data.referral.id} submitted to GP Dashboard.`)
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Error submitting referral')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Step 1</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">Patient Intake</h2>

        <form onSubmit={handleAnalyze} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Patient Name</label>
              <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)}
                placeholder="Full name"
                className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-amber-400" />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Email</label>
              <input type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="patient@example.com"
                className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-amber-400" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Affected Area</label>
            <SymptomBodyPicker value={bodyPart} onChange={setBodyPart} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Pain Level ({painLevel}/10)</label>
              <input type="range" min="1" max="10" value={painLevel} onChange={(e) => setPainLevel(e.target.value)}
                className="mt-3 w-full accent-[var(--accent)]" />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Duration</label>
              <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 3 days"
                className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-amber-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Key Symptoms</label>
            <input type="text" value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. swelling, locking, unable to bear weight"
              className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-amber-400" />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Clinical Narrative</label>
            <textarea rows={4} value={intakeText} onChange={(e) => setIntakeText(e.target.value)}
              placeholder="Describe what happened in free text…"
              className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-white p-4 text-sm leading-6 text-[var(--foreground)] outline-none focus:border-amber-400" />
          </div>

          <button type="submit" disabled={isAnalyzing}
            className="w-full rounded-full bg-[var(--foreground)] py-3.5 text-sm font-medium text-white shadow-md transition hover:bg-slate-800 disabled:opacity-50">
            {isAnalyzing ? 'Running AI Triage…' : 'Run AI Triage & Draft Letter'}
          </button>
        </form>
      </div>

      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Step 2</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">AI Triage Output</h2>
          </div>
          {triage && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              triage.urgencyLevel === 'red' ? 'bg-red-100 text-red-700'
              : triage.urgencyLevel === 'yellow' ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
            }`}>{triage.urgencyLevel}</span>
          )}
        </div>

        {triage ? (
          <div className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Specialist</div>
                <div className="mt-1 font-semibold text-[var(--foreground)]">{triage.specialistType}</div>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Rationale</div>
                <div className="mt-1 text-xs leading-5 text-[var(--muted)]">{triage.rationale}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Summary</div>
              <p className="mt-1 text-sm text-[var(--foreground)]">{triage.summary}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-amber-900">Referral Letter</div>
              <pre className="whitespace-pre-wrap font-sans text-xs leading-6 text-amber-950/80">{triage.referralLetter}</pre>
            </div>
            <button type="button" onClick={handleSubmit} disabled={isSubmitting || !!successId}
              className="w-full rounded-full bg-[var(--accent)] py-3.5 text-sm font-medium text-white shadow-md transition hover:bg-amber-600 disabled:opacity-50">
              {isSubmitting ? 'Sending to GP Dashboard…' : successId ? `Submitted (${successId})` : 'Approve & Send Referral'}
            </button>
          </div>
        ) : (
          <div className="mt-16 py-16 text-center text-sm text-[var(--muted)]">
            Fill in the intake form and click &quot;Run AI Triage&quot; to generate results.
          </div>
        )}

        {feedback && (
          <div className="mt-4 rounded-xl border border-[var(--line)] bg-white p-3 text-center text-xs text-[var(--foreground)]">
            {feedback}
            {successId && <a href="/gp-dashboard" className="ml-2 font-medium text-blue-600 underline">View GP Dashboard →</a>}
          </div>
        )}
      </div>
    </div>
  )
}
