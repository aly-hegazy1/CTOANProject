import IntakeForm from "../components/IntakeForm"

export default function IntakePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background gradients matching the homepage */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-12%] h-80 w-80 rounded-full bg-amber-300/25 blur-3xl" />
        <div className="absolute right-[-12%] top-16 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute bottom-[-12%] left-1/3 h-80 w-80 rounded-full bg-slate-300/20 blur-3xl" />
      </div>

      <section className="mx-auto flex w-full max-w-3xl flex-col px-6 py-12 sm:px-10 sm:py-20">
        <header className="mb-10 flex flex-col items-center text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Patient Portal</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-balance text-[var(--foreground)] sm:text-5xl">
            Symptom Intake
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
            Please describe what you are experiencing. This information will be reviewed by our clinical team to connect you with the right specialist.
          </p>
        </header>

        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]/90 p-5 shadow-[0_30px_90px_rgba(19,33,47,0.12)] backdrop-blur">
          <IntakeForm />
        </div>
      </section>
    </main>
  )
}