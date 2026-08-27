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
  // New Demographics State
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Existing State
  const [intakeText, setIntakeText] = useState("");
  const [selectedBodyParts, setSelectedBodyParts] = useState<BodyPartId[]>([
    "knee-left",
  ]);
  const [duration, setDuration] = useState(DURATION_OPTIONS[0]);
  const [insurance, setInsurance] = useState(INSURANCE_OPTIONS[0]);
  const [location, setLocation] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [painLevel, setPainLevel] = useState("5");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function toggleSymptom(tag: string) {
    setSelectedSymptoms((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
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
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          height,
          weight,
          intakeText,
          bodyPart: selectedBodyParts.length
            ? selectedBodyParts.join(", ")
            : "knee-left",
          duration,
          painLevel,
          location,
          insurance,
          symptoms: selectedSymptoms.join(", "),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit intake form.");
      }

      const data = await response.json();
      setTriageResult(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- SUCCESS / RESULTS STATE ---
  if (triageResult) {
    const isUrgent = triageResult.urgencyLevel.toLowerCase() === "red";

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="rounded-[1.5rem] border border-[var(--line)] bg-[#fbf7f1] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                Triage Complete
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                Next Steps Identified
              </h2>
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
            <h3 className="text-sm font-medium text-[var(--foreground)]">
              Clinical Summary
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {triageResult.summary}
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Recommended Providers in {location || "your area"}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            These {triageResult.specialistType.toLowerCase()} clinics match your
            location and accept {insurance}.
          </p>

          <div className="mt-6 grid gap-4">
            {triageResult.providers.map((provider, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center sm:justify-between transition hover:border-amber-300"
              >
                <div>
                  <div className="font-semibold text-[var(--foreground)]">
                    {provider.name}
                  </div>
                  <div className="mt-1 text-sm text-[var(--muted)]">
                    {provider.address}
                  </div>
                  <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                    ✓ {provider.matchReason}
                  </div>
                </div>

                {/* Changed from <button> to <a> tag using tel: protocol */}
                <a
                  href={`tel:${provider.phone}`}
                  className="flex items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 sm:w-auto w-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z"
                      clipRule="evenodd"
                    />
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

  // --- INTAKE FORM STATE ---
  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.5rem] border border-[var(--line)] bg-[#fbf7f1] p-6 sm:p-8 space-y-6"
    >
      {/* Demographics Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <label className="rounded-2xl bg-white p-4 shadow-sm border border-transparent transition-colors focus-within:border-amber-400">
          <div className="font-medium text-[var(--foreground)] text-sm">
            Age
          </div>
          <input
            type="number"
            required
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 34"
            className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none"
          />
        </label>

        <label className="rounded-2xl bg-white p-4 shadow-sm border border-transparent transition-colors focus-within:border-amber-400">
          <div className="font-medium text-[var(--foreground)] text-sm">
            Height
          </div>
          <input
            type="text"
            required
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g. 5'10&quot;"
            className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none"
          />
        </label>

        <label className="rounded-2xl bg-white p-4 shadow-sm border border-transparent transition-colors focus-within:border-amber-400">
          <div className="font-medium text-[var(--foreground)] text-sm">
            Weight
          </div>
          <input
            type="text"
            required
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 165 lbs"
            className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none"
          />
        </label>
      </div>

      <div className="space-y-2">
        <label
          className="block text-sm font-medium text-[var(--foreground)]"
          htmlFor="intakeText"
        >
          What brings you in today?
        </label>
        <textarea
          id="intakeText"
          value={intakeText}
          onChange={(event) => setIntakeText(event.target.value)}
          placeholder="e.g. I fell while running yesterday and my left knee is swelling..."
          required
          rows={3}
          className="w-full rounded-2xl border border-[var(--line)] bg-white p-4 text-sm leading-6 text-[var(--foreground)] outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-transparent transition-colors">
          <div className="font-medium text-[var(--foreground)] text-sm mb-3">
            Affected Body Part
          </div>
          <SymptomBodyPicker
            value={selectedBodyParts}
            onChange={setSelectedBodyParts}
            multiple
            compact
            maxSelections={5}
            ariaLabel="Select the affected body area"
          />
        </div>

        <label className="rounded-2xl bg-white p-4 shadow-sm border border-transparent transition-colors focus-within:border-amber-400">
          <div className="font-medium text-[var(--foreground)] text-sm">
            Duration
          </div>
          <select
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none"
          >
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="rounded-2xl bg-white p-4 shadow-sm border border-transparent transition-colors focus-within:border-amber-400">
          <div className="font-medium text-[var(--foreground)] text-sm">
            Location (Zip or City)
          </div>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. 10001 or New York, NY"
            className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--foreground)] outline-none"
          />
        </label>

        <label className="rounded-2xl bg-white p-4 shadow-sm border border-transparent transition-colors focus-within:border-amber-400">
          <div className="font-medium text-[var(--foreground)] text-sm">
            Insurance Provider
          </div>
          <select
            value={insurance}
            onChange={(e) => setInsurance(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none"
          >
            {INSURANCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <label className="rounded-2xl bg-white p-4 shadow-sm border border-transparent transition-colors focus-within:border-amber-400 sm:col-span-2">
          <div className="flex justify-between font-medium text-[var(--foreground)] text-sm">
            <span>Pain Level</span>
            <span className="text-[var(--muted)]">{painLevel}/10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={painLevel}
            onChange={(event) => setPainLevel(event.target.value)}
            className="mt-4 w-full accent-[var(--foreground)]"
          />
        </label>

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:col-span-2">
          <div className="font-medium text-[var(--foreground)] text-sm mb-3">
            Specific Symptoms
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SYMPTOM_TAGS.map((tag) => {
              const isSelected = selectedSymptoms.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleSymptom(tag)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-white text-[var(--muted)] border border-[var(--line)] hover:border-amber-400 hover:text-[var(--foreground)]"
                  }`}
                >
                  {isSelected && <span className="mr-1.5 opacity-60">✓</span>}
                  {tag}
                </button>
              );
            })}

            {selectedSymptoms
              .filter((tag) => !SYMPTOM_TAGS.includes(tag))
              .map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleSymptom(tag)}
                  className="rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-4 py-1.5 text-xs font-medium transition-all hover:bg-red-100 hover:text-red-800 hover:border-red-200"
                >
                  <span className="mr-1.5 opacity-60">✓</span>
                  {tag}
                </button>
              ))}

            <div className="flex items-center rounded-full border border-[var(--line)] bg-white p-0.5 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-all">
              <input
                type="text"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomSymptom();
                  }
                }}
                placeholder="+ Add other..."
                className="w-28 bg-transparent px-3 py-1 text-xs text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
              {customSymptom.trim() && (
                <button
                  type="button"
                  onClick={handleAddCustomSymptom}
                  className="rounded-full bg-[var(--foreground)] px-3 py-1 text-xs font-medium text-white transition hover:opacity-90"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || intakeText.trim() === ""}
          className="w-full rounded-full bg-[var(--foreground)] px-5 py-4 text-sm font-medium text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
        >
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