'use client';

import SymptomBodyPicker from '../components/SymptomBodyPicker';

export default function TestPage() {
  return (
    <main className="p-6">
      <div className="mx-auto max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <SymptomBodyPicker
          ariaLabel="Select symptom area"
          compact
          multiple
          maxSelections={5}
          onChange={(selected) => console.log(selected)}
        />
      </div>
    </main>
  );
}