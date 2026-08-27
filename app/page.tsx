"use client"

import { useState } from "react"
import SymptomBodyPicker, { type BodyPartId } from "./components/SymptomBodyPicker"

const referralFlow = [
  {
    step: "Intake",
    title: "Patient symptoms land in one structured form",
    description:
      "Duration, pain level, affected area, red flags, and free text are captured once and reused across every view.",
  },
  {
    step: "Triage",
    title: "Gemini suggests urgency and specialist type",
    description:
      "Fracture, chronic pain, and post-op follow different routes, but they share the same AI triage backbone.",
  },
  {
    step: "Review",
    title: "GPs approve, edit, and send referrals",
    description:
      "The clinician stays in control while the platform drafts the summary and recommends the right destination.",
  },
  {
    step: "Handoff",
    title: "Specialists accept and schedule",
    description:
      "The receiving team sees the summary, urgency badge, and status trail before the referral is closed.",
  },
]

const triageExamples = [
  {
    label: "Possible fracture",
    urgency: "Red",
    specialist: "Orthopedics",
    detail: "Severe pain after fall, swelling, and inability to bear weight.",
  },
  {
    label: "Chronic knee pain",
    urgency: "Yellow",
    specialist: "Orthopedics",
    detail: "Gradual onset over 6 months with stiffness and activity limitation.",
  },
  {
    label: "Post-op follow-up",
    urgency: "Green",
    specialist: "Orthopedics",
    detail: "Routine check after uncomplicated knee replacement.",
  },
]

const statusSteps = ["submitted", "reviewed", "accepted", "scheduled"]

const dashboardMetrics = [
  { value: "18 min", label: "average time to triage" },
  { value: "92%", label: "referrals routed without rework" },
  { value: "3 days", label: "median specialist wait estimate" },
]

const specialistTasks = [
  {
    title: "AI summary",
    text: "Likely meniscal injury. Urgency: yellow. Needs orthopedics within 72 hours.",
  },
  {
    title: "Clinical note",
    text: "Patient reports swelling, pain with stairs, and no systemic red flags.",
  },
  {
    title: "Next step",
    text: "Accept referral, request imaging if needed, and schedule first available clinic slot.",
  },
]

export default function Home() {
  const [intakeText, setIntakeText] = useState(
    "Patient fell while running yesterday. Left knee swelling, pain 8/10, unable to bear weight.",
  )
  const [selectedBodyParts, setSelectedBodyParts] = useState<BodyPartId[]>([
    "knee-left",
  ])
  const [symptoms, setSymptoms] = useState("swelling, severe pain, inability to bear weight")
  const [duration, setDuration] = useState("1 day")
  const [painLevel, setPainLevel] = useState("8")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [triageResult, setTriageResult] = useState<{
    urgencyLevel: string
    specialistType: string
    summary: string
    referralLetter: string
    rationale: string
  } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/gemini/triage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intakeText,
          bodyPart: selectedBodyParts.length ? selectedBodyParts.join(", ") : "knee-left",
          symptoms,
          duration,
          painLevel,
        }),
      })

      const payload = (await response.json()) as
        | { triage: typeof triageResult }
        | { error: string }

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Gemini request failed")
      }

      if ("triage" in payload) {
        setTriageResult(payload.triage)
      }
    } catch (submitError) {
      setErrorMessage(submitError instanceof Error ? submitError.message : "Unknown error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-12%] h-80 w-80 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="absolute right-[-12%] top-16 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute bottom-[-12%] left-1/3 h-80 w-80 rounded-full bg-slate-300/20 blur-3xl" />
      </div>

      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-5 py-3 shadow-[0_20px_60px_rgba(19,33,47,0.08)] backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Care coordination platform</p>
            <p className="mt-1 text-sm font-medium text-[var(--foreground)]">CareFlow OS</p>
          </div>
          <nav className="flex items-center gap-2">
            <a
              href="/intake"
              className="rounded-full bg-[var(--foreground)] px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
            >
              Write a Referral
            </a>
            <a
              href="/gp-dashboard"
              className="rounded-full border border-[var(--line)] bg-white/75 px-4 py-2 text-xs font-medium text-[var(--foreground)] transition hover:bg-white"
            >
              GP Dashboard
            </a>
            <a
              href="/specialist-dashboard"
              className="rounded-full border border-[var(--line)] bg-white/75 px-4 py-2 text-xs font-medium text-[var(--foreground)] transition hover:bg-white"
            >
              Specialist Login
            </a>
          </nav>
        </header>

        <div className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-[var(--muted)] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Referral flow, reframed as care orchestration
            </div>

            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-balance text-[var(--foreground)] sm:text-6xl lg:text-7xl">
              One platform for intake, AI triage, referral review, and specialist handoff.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
              Ortho is the flagship demo because urgency is obvious: fracture, chronic pain,
              and post-op follow-up all need different routing. The same workflow can expand to
              cardio, derm, and beyond without changing the product story.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/intake"
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-amber-900/20 transition hover:-translate-y-0.5 hover:bg-amber-600"
              >
                Write a Referral →
              </a>
              <a
                href="/gp-dashboard"
                className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5"
              >
                GP Dashboard
              </a>
              <a
                href="#demo"
                className="rounded-full border border-[var(--line)] bg-white/75 px-5 py-3 text-sm font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                View demo
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {dashboardMetrics.map((metric) => (
                <div key={metric.label} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)]/85 p-5 shadow-sm">
                  <div className="text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                    {metric.value}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[var(--muted)]">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div id="demo" className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-5 shadow-[0_30px_90px_rgba(19,33,47,0.12)] backdrop-blur">
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-[#fbf7f1] p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Patient intake</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                      Send intake text to Gemini
                    </h2>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    POST /api/gemini/triage
                  </span>
                </div>

                <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="intakeText">
                  Intake text
                </label>
                <textarea
                  id="intakeText"
                  value={intakeText}
                  onChange={(event) => setIntakeText(event.target.value)}
                  rows={5}
                  className="w-full rounded-2xl border border-[var(--line)] bg-white p-4 text-sm leading-6 text-[var(--foreground)] outline-none transition focus:border-amber-400"
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending..." : "Run Gemini triage"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTriageResult(null)
                      setErrorMessage(null)
                      setIntakeText(
                        "Patient fell while running yesterday. Left knee swelling, pain 8/10, unable to bear weight.",
                      )
                      setSelectedBodyParts(["knee-left"])
                      setSymptoms("swelling, severe pain, inability to bear weight")
                      setDuration("1 day")
                      setPainLevel("8")
                    }}
                    className="rounded-full border border-[var(--line)] bg-white/75 px-5 py-3 text-sm font-medium text-[var(--foreground)] transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    Reset example
                  </button>
                </div>

                <div className="grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
                  <div className="flex flex-col items-center rounded-2xl bg-white p-4 shadow-sm sm:col-span-2">
                    <div className="mb-3 w-full text-left font-medium text-[var(--foreground)]">Body area</div>
                    <SymptomBodyPicker
                      value={selectedBodyParts}
                      onChange={setSelectedBodyParts}
                      multiple
                      maxSelections={5}
                      compact
                      className="mx-auto"
                      ariaLabel="Select the affected body area"
                    />
                  </div>
                  <label className="rounded-2xl bg-white p-4 shadow-sm" htmlFor="painLevel">
                    <div className="font-medium text-[var(--foreground)]">Pain level</div>
                    <input
                      id="painLevel"
                      type="range"
                      min="0"
                      max="10"
                      value={painLevel}
                      onChange={(event) => setPainLevel(event.target.value)}
                      className="mt-3 w-full"
                    />
                    <div className="mt-2 text-xs text-[var(--muted)]">{painLevel}/10</div>
                  </label>
                  <label className="rounded-2xl bg-white p-4 shadow-sm" htmlFor="duration">
                    <div className="font-medium text-[var(--foreground)]">Duration</div>
                    <input
                      id="duration"
                      value={duration}
                      onChange={(event) => setDuration(event.target.value)}
                      placeholder="e.g. 3 days"
                      className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)]"
                    />
                  </label>
                  <label className="rounded-2xl bg-white p-4 shadow-sm" htmlFor="symptoms">
                    <div className="font-medium text-[var(--foreground)]">Symptoms</div>
                    <input
                      id="symptoms"
                      value={symptoms}
                      onChange={(event) => setSymptoms(event.target.value)}
                      placeholder="e.g. swelling, fever, rash"
                      className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)]"
                    />
                  </label>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="font-medium text-[var(--foreground)]">Status</div>
                    submitted → reviewed → accepted → scheduled
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="font-medium text-[var(--foreground)]">Route</div>
                    Triage text is posted to the server, not the browser.
                  </div>
                </div>

                {errorMessage ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    {errorMessage}
                  </div>
                ) : null}

                {triageResult ? (
                  <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                    <div className="flex items-center justify-between gap-3 text-sm font-medium text-amber-900">
                      <span>Gemini response</span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.28em]">
                        {triageResult.urgencyLevel}
                      </span>
                    </div>
                    <div className="grid gap-3 text-sm text-amber-950/90 sm:grid-cols-2">
                      <div className="rounded-xl bg-white/80 p-3">
                        <div className="font-medium text-[var(--foreground)]">Specialist</div>
                        {triageResult.specialistType}
                      </div>
                          <div className="rounded-xl bg-white/80 p-3">
                            <div className="font-medium text-[var(--foreground)]">Urgency</div>
                            {triageResult.urgencyLevel}
                          </div>
                      <div className="rounded-xl bg-white/80 p-3">
                        <div className="font-medium text-[var(--foreground)]">Summary</div>
                        {triageResult.summary}
                      </div>
                      <div className="rounded-xl bg-white/80 p-3 sm:col-span-2">
                        <div className="font-medium text-[var(--foreground)]">Referral letter</div>
                        {triageResult.referralLetter}
                      </div>
                      <div className="rounded-xl bg-white/80 p-3 sm:col-span-2">
                        <div className="font-medium text-[var(--foreground)]">Rationale</div>
                        {triageResult.rationale}
                      </div>
                    </div>
                  </div>
                ) : null}
              </form>
            </div>
          </div>
        </div>

        <section className="grid gap-4 pb-6 md:grid-cols-2 xl:grid-cols-4">
          {referralFlow.map((item, index) => (
            <article
              key={item.step}
              className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)]/90 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">0{index + 1}</span>
                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-medium text-[var(--muted)]">
                  {item.step}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
            </article>
          ))}
        </section>

        <section id="triage" className="grid gap-6 pb-20 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">AI triage / routing</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              Fast classification into urgency plus specialist type.
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              The model returns structured JSON so the UI can consume specialist type, urgency,
              summary, and referral notes directly. That keeps the demo practical instead of speculative.
            </p>

            <div className="mt-6 space-y-3">
              {triageExamples.map((example) => (
                <div key={example.label} className="rounded-2xl border border-[var(--line)] bg-white/80 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium text-[var(--foreground)]">{example.label}</div>
                    <div className="text-sm text-[var(--muted)]">{example.specialist}</div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className={`rounded-full px-2.5 py-1 font-semibold ${example.urgency === 'Red' ? 'bg-red-100 text-red-700' : example.urgency === 'Yellow' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {example.urgency}
                    </span>
                    <span className="text-[var(--muted)]">{example.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="grid gap-6 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-6 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">GP and specialist views</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                The same referral, seen from both sides.
              </h2>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-5">
                <div className="text-sm font-semibold text-[var(--foreground)]">GP dashboard</div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  List patients, inspect the AI suggestion, approve or edit the referral, then send it onward.
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="rounded-xl bg-slate-100 px-3 py-2">Patient: J. Patel</div>
                  <div className="rounded-xl bg-slate-100 px-3 py-2">AI suggestion: orthopedics, urgent</div>
                  <div className="rounded-xl bg-slate-100 px-3 py-2">Action: approve and send</div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-5">
                <div className="text-sm font-semibold text-[var(--foreground)]">Specialist dashboard</div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Receive the referral, read the summary, accept or schedule, and add follow-up notes.
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  {specialistTasks.map((task) => (
                    <div key={task.title} className="rounded-xl bg-slate-100 px-3 py-2">
                      <div className="font-medium text-[var(--foreground)]">{task.title}</div>
                      <div className="mt-1 text-[var(--muted)]">{task.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[var(--line)] bg-[#faf5ea] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Status tracker</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                    Simple state machine from submission to scheduling.
                  </h3>
                </div>
                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-medium text-[var(--muted)]">
                  patient-facing friendly
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {statusSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${index < 2 ? 'bg-emerald-100 text-emerald-700' : index === 2 ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                      {step}
                    </span>
                    {index < statusSteps.length - 1 ? <span className="h-px w-5 bg-[var(--line)]" /> : null}
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>
      </section>
    </main>
  )
}