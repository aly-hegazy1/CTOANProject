export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-12%] h-80 w-80 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="absolute right-[-12%] top-16 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute bottom-[-12%] left-1/3 h-80 w-80 rounded-full bg-slate-300/20 blur-3xl" />
      </div>

      <div className="w-full max-w-lg text-center">
        <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Care coordination platform</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-[var(--foreground)] sm:text-6xl">
          CareFlow OS
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--muted)]">
          Describe your symptoms, get matched with the right specialist, and track your care — all in one place.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href="/intake"
            className="flex flex-col items-center gap-2 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 px-10 py-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <span className="text-4xl">📋</span>
            <span className="text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]">Intake Form</span>
            <span className="text-sm text-[var(--muted)]">Describe your symptoms and get matched with a specialist</span>
          </a>

          <a
            href="/tracker"
            className="flex flex-col items-center gap-2 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 px-10 py-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <span className="text-4xl">📍</span>
            <span className="text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]">Track Referral</span>
            <span className="text-sm text-[var(--muted)]">Check your current step in the care process</span>
          </a>
        </div>

        <p className="mt-8 text-xs text-[var(--muted)]">
          Are you a specialist?{' '}
          <a href="/specialist-dashboard" className="font-medium text-[var(--accent)] hover:underline">
            Log in here →
          </a>
        </p>
      </div>
    </main>
  )
}
