'use client'

import { useState } from 'react'

const specialistOptions = [
  'Orthopedics',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Gastroenterology',
  'Primary Care'
]

type TriageData = {
  urgencyLevel: 'red' | 'yellow' | 'green'
  specialistType: string
  summary: string
  referralLetter: string
  rationale: string
}

export default function IntakeWorkspace() {
  const [patientName, setPatientName] = useState('Jordan Patel')
  const [patientEmail, setPatientEmail] = useState('jordan.patel@example.com')
  const [bodyPart, setBodyPart] = useState('knee')
  const [symptoms, setSymptoms] = useState('Acute left knee locking, pain 8/10, unable to bear weight after sports pivot.')
  const [duration, setDuration] = useState('1 day')
  const [painLevel, setPainLevel] = useState('8')
  const [intakeText, setIntakeText] = useState(
    'Patient felt a pop in left knee during soccer match. Now experiencing locking, severe joint swelling, and inability to bear weight.'
  )

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [triage, setTriage] = useState<TriageData | null>({
    urgencyLevel: 'red',
    specialistType: 'Orthopedics',
    summary: 'Acute internal derangement of the left knee with mechanical locking and severe pain.',
    referralLetter:
      'Dear Orthopedic Specialist,\n\nPatient Jordan Patel presents with acute knee trauma sustained during athletic activity, exhibiting mechanical locking and an inability to achieve full extension. Findings suggest acute meniscal pathology or ligamentous injury. Immediate clinical evaluation and MRI are strongly recommended.\n\nSincerely,\nDr. Alex Vance, MD',
    rationale: 'Mechanical locking combined with acute trauma and high pain score indicates potential displaced meniscus tear requiring urgent specialist evaluation.'
  })
  const [feedback, setFeedback] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault()
    setIsAnalyzing(true)
    setFeedback(null)
    setSuccessId(null)

    try {
      const res = await fetch('/api/gemini/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intakeText, bodyPart, symptoms, duration, painLevel })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Triage failed')
      setTriage(data.triage)
      setFeedback('Gemini analysis complete & structured JSON populated!')
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Error analyzing intake')
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function handleSubmitReferral() {
    if (!triage) return
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
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
          rationale: triage.rationale
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create referral')
      setSuccessId(data.referral.id)
      setFeedback(`Referral ${data.referral.id} submitted successfully to GP Dashboard!`)
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Error submitting referral')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Step 1</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
              Patient Intake Form
            </h2>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            AI-Powered
          </span>
        </div>

        <form onSubmit={handleAnalyze} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Patient Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Patient Email</label>
              <input
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Body Part</label>
              <select
                value={bodyPart}
                onChange={(e) => setBodyPart(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--foreground)]"
              >
                <option value="knee">Knee</option>
                <option value="hip">Hip</option>
                <option value="shoulder">Shoulder</option>
                <option value="spine">Spine / Back</option>
                <option value="wrist">Wrist / Hand</option>
                <option value="chest">Chest / Cardiac</option>
                <option value="skin">Skin / Derm</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Pain Level ({painLevel}/10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(e.target.value)}
                className="mt-3 w-full accent-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--foreground)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Key Symptoms</label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--foreground)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Clinical Narrative / Free Text</label>
            <textarea
              rows={4}
              value={intakeText}
              onChange={(e) => setIntakeText(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-white p-4 text-sm leading-6 text-[var(--foreground)]"
            />
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full rounded-full bg-[var(--foreground)] py-3.5 text-sm font-medium text-white shadow-md transition hover:bg-slate-800 disabled:opacity-50"
          >
            {isAnalyzing ? 'Running Gemini AI Triage...' : 'Run AI Triage & Draft Letter'}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Step 2</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                AI Triage & Letter Output
              </h3>
            </div>
            {triage && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                  triage.urgencyLevel === 'red'
                    ? 'bg-red-100 text-red-700'
                    : triage.urgencyLevel === 'yellow'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                Urgency: {triage.urgencyLevel}
              </span>
            )}
          </div>

          {triage ? (
            <div className="mt-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                  <div className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Suggested Specialist</div>
                  <div className="mt-1 text-base font-semibold text-[var(--foreground)]">{triage.specialistType}</div>
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                  <div className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Clinical Rationale</div>
                  <div className="mt-1 text-xs leading-5 text-[var(--muted)]">{triage.rationale}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                <div className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Clinical Summary</div>
                <p className="mt-1 text-sm text-[var(--foreground)]">{triage.summary}</p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-amber-900">
                  <span>Auto-Generated Referral Letter</span>
                  <span className="font-mono text-[10px]">Gemini 3.6 Flash</span>
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-6 text-amber-950/80">
                  {triage.referralLetter}
                </pre>
              </div>

              <button
                type="button"
                onClick={handleSubmitReferral}
                disabled={isSubmitting || !!successId}
                className="w-full rounded-full bg-[var(--accent)] py-3.5 text-sm font-medium text-white shadow-md transition hover:bg-amber-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending to GP Dashboard...' : successId ? `Submitted (${successId})` : 'Approve & Send Referral'}
              </button>
            </div>
          ) : (
            <div className="mt-12 py-12 text-center text-sm text-[var(--muted)]">
              Click &quot;Run AI Triage & Draft Letter&quot; to generate structured triage results.
            </div>
          )}

          {feedback && (
            <div className="mt-4 rounded-xl border border-[var(--line)] bg-white p-3 text-center text-xs text-[var(--foreground)]">
              {feedback} {successId && <a href="/gp" className="ml-2 font-medium text-blue-600 underline">View GP Dashboard →</a>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
