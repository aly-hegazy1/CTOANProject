'use client';

import SymptomBodyPicker from '../components/SymptomBodyPicker';

export default function TestPage() {
  return (
    <main className="p-6">
      <SymptomBodyPicker
        ariaLabel="Select symptom area"
        onChange={(selected) => console.log(selected)}
      />
    </main>
  );
}