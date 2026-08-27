"use client";

import { useState } from "react";
import SymptomBodyPicker, { type BodyPartId } from "./SymptomBodyPicker";

const DURATION_OPTIONS = [
  "Less than 24 hours",
  "1 to 3 days",
  "1 week",
  "A couple of weeks",
  "1 month",
  "More than a month",
  "Chronic (6+ months)",
];

const INSURANCE_OPTIONS = [
  "Aetna",
  "BlueCross BlueShield",
  "Cigna",
  "UnitedHealthcare",
  "Medicare",
  "Medicaid",
  "Self-Pay / Out of Pocket",
];

const SYMPTOM_TAGS = [
  "Swelling",
  "Sharp Pain",
  "Dull Ache",
  "Clicking / Popping",
  "Instability",
  "Numbness / Tingling",
  "Fever",
  "Redness",
  "Bruising",
  "Limited Mobility",
];

type Provider = {
  name: string;
  address: string;
  phone: string;
  matchReason: string;
};

type TriageResult = {
  urgencyLevel: string;
  specialistType: string;
  summary: string;
  providers: Provider[];
};

export default function IntakeForm() {
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [intakeText, setIntakeText] = useState("");
  const [selectedBodyParts, setSelectedBodyParts] = useState<BodyPartId[]>(["knee-left"]);
  const [duration, setDuration] = useState(DURATION_OPTIONS[0]);
  const [insurance, setInsurance] = useState(INSURANCE_OPTIONS[0]);
  const [location, setLocation] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [painLevel, setPainLevel] = useState("5");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function toggleSymptom(tag: string) {
    setSelectedSymptoms((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleAddCustomSymptom() {
    const trimmed = customSymptom.trim();
    if (trimmed && !selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms((prev) => [...prev, trimmed]);
    }
    setCustomSymptom("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Step 1: get AI triage + provider list
      const triageRes = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          height,
          weight,
          intakeText,
          bodyPart: selectedBodyParts.length ? selectedBodyParts.join(", ") : "knee-left",
          duration,
          painLevel,
          location,
          insurance,
          symptoms: selectedSymptoms.join(", "),
        }),
      });

      if (!triageRes.ok) throw new Error("Failed to submit intake form.");
      const triage: TriageResult = await triageRes.json();
      setTriageResult(triage);

      // Step 2: save referral to store so specialist can see it and patient can track it
      const saveRes = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: patientName || "Anonymous Patient",
          patientEmail,
          bodyPart: selectedBodyParts.join(", ") || "not specified",
          symptoms: selectedSymptoms.join(", ") || intakeText,
          duration,
          painLevel,
          intakeText,
          urgencyLevel: triage.urgencyLevel.toLowerCase(),
          specialistType: triage.specialistType,
          summary: triage.summary,
          referralLetter: "",
          rationale: "",
        }),
      });

      if (saveRes.ok) {
        const saved = await saveRes.json();
        setTrackingId(saved.referral.id);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- SUCCESS / RESULTS STATE ---
  if (triageResult) {
    const isUrgent = triageResult.urgencyLevel.toLowerCase() === "red";

    return (
      <div className="space-y-6">
        {/* Tracking ID banner */}
        {trackingId && (
          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-center">
            <p className="text-sm font-medium text-emerald-800">Your intake form has been submitted!</p>
            <p className="mt-1 text-xs text-emerald-700">
              Save your tracking ID to check your status anytime:
            </p>
            <p className="mt-3 font-mono text-2xl font-bold tracking-widest text-emerald-900">{trackingId}</p>
            <a
              href={`/referrals/${trackingId}`}
              className="mt-4 inline-block rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800"
            >
              Track my referral →
            </a>
          </div>
        )}

        <div className="rounded-[1.5rem] border border-[var(--line)] bg-[#fbf7f1] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Triage Complete</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Recommended Specialists</h2>
            </div>
            <div className="flex gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isUrgent
                    ? "bg-red-100 text-red-700"
                    : triageResult.urgencyLevel.toLowerCase() === "yellow"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-75" />
                Urgency: {triageResult.urgencyLevel}
              </span>
              <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--muted)]">
                {triageResult.specialistType}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-[var(--foreground)]">Clinical Summary</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{triageResult.summary}</p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Recommended Providers in {location || "your area"}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            These {triageResult.specialistType.toLowerCase()} clinics match your location and accept {insurance}.
          </p>

          <div className="mt-6 grid gap-4">
            {triageResult.providers.map((provider, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 transition hover:border-amber-300 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-semibold text-[var(--foreground)]">{provider.name}</div>
                  <div className="mt-1 text-sm text-[var(--muted)]">{provider.address}</div>
                  <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                    ✓ {provider.matchReason}
                  </div>
                </div>
                <a
                  href={`tel:${provider.phone}`}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 sm:w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
                  </svg>
                  Call {provider.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- INTAKE FORM ---
  return (
    <form onSubmit={handleSubmit} className="rounded-[1.5rem] border border-[var(--line)] bg-[#fbf7f1] p-6 sm:p-8 space-y-6">
      {/* Patient name + email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block rounded-2xl bg-white p-4 shadow-sm border border-transparent focus-within:border-amber-400">
          <div className="text-sm font-medium text-[var(--foreground)]">Your Name</div>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="e.g. Jordan Patel"
            className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none"
          />
        </label>
        <label className="block rounded-2xl bg-white p-4 shadow-sm border border-transparent focus-within:border-amber-400">
          <div className="text-sm font-medium text-[var(--foreground)]">
            Email <span className="text-[var(--accent)]">*</span>
          </div>
          <input
            type="email"
            required
            value={patientEmail}
            onChange={(e) => setPatientEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none"
          />
          <p className="mt-1 text-[10px] text-[var(--muted)]">We&apos;ll send your tracking ID and status updates here</p>
        </label>
      </div>

      {/* Demographics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <label className="rounded-2xl bg-white p-4 shadow-sm border border-transparent focus-within:border-amber-400">
          <div className="text-sm font-medium text-[var(--foreground)]">Age</div>
          <input type="number" required value={age} onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 34"
            className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
        </label>
        <label className="rounded-2xl bg-white p-4 shadow-sm border border-transparent focus-within:border-amber-400">
          <div className="text-sm font-medium text-[var(--foreground)]">Height</div>
          <input type="text" required value={height} onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g. 5'10&quot;"
            className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
        </label>
        <label className="rounded-2xl bg-white p-4 shadow-sm border border-transparent focus-within:border-amber-400">
          <div className="text-sm font-medium text-[var(--foreground)]">Weight</div>
          <input type="text" required value={weight} onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 165 lbs"
            className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
        </label>
      </div>

      {/* What brings you in */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="intakeText">
          What brings you in today?
        </label>
        <textarea
          id="intakeText" value={intakeText} onChange={(e) => setIntakeText(e.target.value)}
          placeholder="e.g. I fell while running yesterday and my left knee is swelling..."
          required rows={3}
          className="w-full rounded-2xl border border-[var(--line)] bg-white p-4 text-sm leading-6 text-[var(--foreground)] outline-none transition focus:border-amber-400"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-transparent">
          <div className="text-sm font-medium text-[var(--foreground)] mb-3">Affected Body Part</div>
          <SymptomBodyPicker value={selectedBodyParts} onChange={setSelectedBodyParts} multiple compact maxSelections={5} ariaLabel="Select the affected body area" />
        </div>

        <label className="rounded-2xl bg-white p-4 shadow-sm border border-transparent focus-within:border-amber-400">
          <div className="text-sm font-medium text-[var(--foreground)]">Duration</div>
          <select value={duration} onChange={(e) => setDuration(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none">
            {DURATION_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </label>

        <label className="rounded-2xl bg-white p-4 shadow-sm border border-transparent focus-within:border-amber-400">
          <div className="text-sm font-medium text-[var(--foreground)]">Location (Zip or City)</div>
          <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. 10001 or New York, NY"
            className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none" />
        </label>

        <label className="rounded-2xl bg-white p-4 shadow-sm border border-transparent focus-within:border-amber-400">
          <div className="text-sm font-medium text-[var(--foreground)]">Insurance Provider</div>
          <select value={insurance} onChange={(e) => setInsurance(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none">
            {INSURANCE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </label>

        <label className="rounded-2xl bg-white p-4 shadow-sm border border-transparent focus-within:border-amber-400 sm:col-span-2">
          <div className="flex justify-between text-sm font-medium text-[var(--foreground)]">
            <span>Pain Level</span>
            <span className="text-[var(--muted)]">{painLevel}/10</span>
          </div>
          <input type="range" min="0" max="10" value={painLevel} onChange={(e) => setPainLevel(e.target.value)}
            className="mt-4 w-full accent-[var(--foreground)]" />
        </label>

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:col-span-2">
          <div className="text-sm font-medium text-[var(--foreground)] mb-3">Specific Symptoms</div>
          <div className="flex flex-wrap items-center gap-2">
            {SYMPTOM_TAGS.map((tag) => {
              const isSelected = selectedSymptoms.includes(tag);
              return (
                <button key={tag} type="button" onClick={() => toggleSymptom(tag)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "border border-amber-200 bg-amber-100 text-amber-800"
                      : "border border-[var(--line)] bg-white text-[var(--muted)] hover:border-amber-400 hover:text-[var(--foreground)]"
                  }`}>
                  {isSelected && <span className="mr-1.5 opacity-60">✓</span>}
                  {tag}
                </button>
              );
            })}
            {selectedSymptoms.filter((t) => !SYMPTOM_TAGS.includes(t)).map((tag) => (
              <button key={tag} type="button" onClick={() => toggleSymptom(tag)}
                className="rounded-full border border-amber-200 bg-amber-100 px-4 py-1.5 text-xs font-medium text-amber-800 transition-all hover:border-red-200 hover:bg-red-100 hover:text-red-800">
                <span className="mr-1.5 opacity-60">✓</span>{tag}
              </button>
            ))}
            <div className="flex items-center rounded-full border border-[var(--line)] bg-white p-0.5 transition-all focus-within:border-amber-400">
              <input type="text" value={customSymptom} onChange={(e) => setCustomSymptom(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomSymptom(); } }}
                placeholder="+ Add other..."
                className="w-28 bg-transparent px-3 py-1 text-xs text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]" />
              {customSymptom.trim() && (
                <button type="button" onClick={handleAddCustomSymptom}
                  className="rounded-full bg-[var(--foreground)] px-3 py-1 text-xs font-medium text-white transition hover:opacity-90">
                  Add
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</div>
      )}

      <div className="pt-2">
        <button type="submit" disabled={isSubmitting || intakeText.trim() === ""}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-5 py-4 text-sm font-medium text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              AI is analyzing symptoms...
            </>
          ) : (
            "Submit to Clinical Team"
          )}
        </button>
      </div>
    </form>
  );
}
