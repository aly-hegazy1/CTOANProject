import { ReferralStatus } from '@/lib/referralStore'

const STEPS: { key: ReferralStatus; label: string; description: string }[] = [
  { key: 'submitted', label: 'Form Submitted', description: 'Your intake form has been received.' },
  { key: 'reviewed', label: 'Reviewed by Specialist', description: 'A specialist has reviewed your form.' },
  { key: 'appointment_made', label: 'Appointment Made', description: 'Your appointment has been scheduled.' },
  { key: 'prescription_prescribed', label: 'Medication Prescribed', description: 'Your prescription has been issued.' },
]

const STATUS_ORDER: ReferralStatus[] = ['submitted', 'reviewed', 'appointment_made', 'prescription_prescribed']

interface StatusTrackerProps {
  status: ReferralStatus
}

export default function StatusTracker({ status }: StatusTrackerProps) {
  const currentIndex = STATUS_ORDER.indexOf(status)

  return (
    <div className="w-full">
      <div className="relative flex items-start justify-between">
        <div className="absolute left-0 right-0 top-5 z-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map((step, idx) => {
          const done = idx < currentIndex
          const active = idx === currentIndex
          return (
            <div key={step.key} className="z-10 flex flex-1 flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors duration-300
                  ${done ? 'border-blue-500 bg-blue-500 text-white' : ''}
                  ${active ? 'border-blue-500 bg-white text-blue-500' : ''}
                  ${!done && !active ? 'border-gray-300 bg-white text-gray-400' : ''}
                `}
              >
                {done ? (
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`mt-2 text-center text-xs font-semibold
                ${active ? 'text-blue-600' : done ? 'text-blue-500' : 'text-gray-400'}`}>
                {step.label}
              </span>
              {active && (
                <p className="mt-1 max-w-[110px] text-center text-xs text-gray-500">{step.description}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
