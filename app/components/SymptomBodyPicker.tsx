'use client'

const BODY_PARTS = [
  { id: 'head', label: 'Head / Neuro' },
  { id: 'chest', label: 'Chest / Cardiac' },
  { id: 'shoulder', label: 'Shoulder' },
  { id: 'back', label: 'Back / Spine' },
  { id: 'wrist', label: 'Wrist / Hand' },
  { id: 'abdomen', label: 'Abdomen' },
  { id: 'hip', label: 'Hip' },
  { id: 'knee', label: 'Knee' },
  { id: 'ankle', label: 'Ankle / Foot' },
  { id: 'skin', label: 'Skin / Derm' },
]

interface SymptomBodyPickerProps {
  value: string
  onChange: (part: string) => void
}

export default function SymptomBodyPicker({ value, onChange }: SymptomBodyPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {BODY_PARTS.map((part) => (
        <button
          key={part.id}
          type="button"
          onClick={() => onChange(part.id)}
          className={`rounded-2xl border px-3 py-2.5 text-left text-sm font-medium transition
            ${value === part.id
              ? 'border-[var(--accent)] bg-amber-50 text-[var(--accent)]'
              : 'border-[var(--line)] bg-white text-[var(--foreground)] hover:border-amber-300 hover:bg-amber-50/40'
            }`}
        >
          {part.label}
        </button>
      ))}
    </div>
  )
}
