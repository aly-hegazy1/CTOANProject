import { ReferralStatus } from '@/lib/referralStore'

const STEPS: { key: ReferralStatus; label: string; description: string }[] = [
  { key: 'submitted', label: 'Submitted', description: 'Your referral has been received.' },
  { key: 'reviewed', label: 'Reviewed by GP', description: 'Your GP has reviewed and approved your referral.' },
  { key: 'accepted', label: 'Accepted', description: 'A specialist has accepted your referral.' },
  { key: 'scheduled', label: 'Scheduled', description: 'Your appointment has been booked.' },
]

const STATUS_ORDER: ReferralStatus[] = ['submitted', 'reviewed', 'accepted', 'scheduled']

interface StatusTrackerProps {
  status: ReferralStatus
  scheduledDate?: string
  assignedSpecialist?: string
}

export default function StatusTracker({ status, scheduledDate, assignedSpecialist }: StatusTrackerProps) {
  const currentIndex = STATUS_ORDER.indexOf(status)

  return (
    <div className="w-full">
      <div className="flex items-start justify-between relative">
        {/* connector line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map((step, idx) => {
          const done = idx < currentIndex
          const active = idx === currentIndex
          return (
            <div key={step.key} className="flex flex-col items-center z-10 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 bg-white
                  ${done ? 'border-blue-500 bg-blue-500 text-white' : ''}
                  ${active ? 'border-blue-500 text-blue-500' : ''}
                  ${!done && !active ? 'border-gray-300 text-gray-400' : ''}
                `}
              >
                {done ? (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`mt-2 text-xs font-semibold text-center ${active ? 'text-blue-600' : done ? 'text-blue-500' : 'text-gray-400'}`}>
                {step.label}
              </span>
              {active && (
                <p className="mt-1 text-xs text-gray-500 text-center max-w-[120px]">{step.description}</p>
              )}
            </div>
          )
        })}
      </div>

      {(assignedSpecialist || scheduledDate) && (
        <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 space-y-1">
          {assignedSpecialist && (
            <p><span className="font-medium">Specialist:</span> {assignedSpecialist}</p>
          )}
          {scheduledDate && (
            <p><span className="font-medium">Appointment:</span> {scheduledDate}</p>
          )}
        </div>
      )}
    </div>
  )
}
