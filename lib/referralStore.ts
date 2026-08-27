export type ReferralStatus = 'submitted' | 'reviewed' | 'appointment_made' | 'prescription_prescribed'
export type UrgencyLevel = 'red' | 'yellow' | 'green'

export type Referral = {
  id: string
  patientName: string
  patientEmail: string
  bodyPart: string
  symptoms: string
  duration: string
  painLevel: string
  intakeText: string
  urgencyLevel: UrgencyLevel
  specialistType: string
  summary: string
  referralLetter: string
  rationale: string
  status: ReferralStatus
  createdAt: string
  notes: { author: string; text: string; timestamp: string }[]
}

const INITIAL_REFERRALS: Referral[] = [
  {
    id: 'ref-101',
    patientName: 'Jordan Patel',
    patientEmail: 'jordan.patel@example.com',
    bodyPart: 'knee',
    symptoms: 'Acute left knee locking, inability to straighten completely after a pivoting injury playing soccer.',
    duration: '2 days',
    painLevel: '8',
    intakeText: 'Patient heard a pop while playing soccer. Now locking and severe lateral pain.',
    urgencyLevel: 'red',
    specialistType: 'Orthopedics',
    summary: 'Acute internal derangement of the left knee with mechanical locking and severe pain.',
    referralLetter: '',
    rationale: 'Mechanical locking combined with acute trauma and high pain score indicates potential displaced meniscus tear.',
    status: 'reviewed',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    notes: [
      { author: 'Specialist', text: 'Reviewed intake form. Urgent case — scheduling within 48 hours.', timestamp: '1 hour ago' }
    ]
  },
  {
    id: 'ref-102',
    patientName: 'Elena Rostova',
    patientEmail: 'elena.rostova@example.com',
    bodyPart: 'shoulder',
    symptoms: 'Gradual right shoulder ache when reaching overhead, worsening over several months.',
    duration: '6 months',
    painLevel: '5',
    intakeText: 'Persistent right shoulder impingement pain, trouble sleeping on right side.',
    urgencyLevel: 'yellow',
    specialistType: 'Orthopedics',
    summary: 'Chronic right shoulder rotator cuff tendinopathy with nocturnal pain and restricted range of motion.',
    referralLetter: '',
    rationale: 'Chronic duration without acute red flags warrants subspecialty outpatient evaluation.',
    status: 'submitted',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    notes: []
  }
]

class ReferralStore {
  private referrals: Referral[] = INITIAL_REFERRALS

  getAll(): Referral[] {
    return [...this.referrals].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  getById(id: string): Referral | undefined {
    return this.referrals.find((r) => r.id === id)
  }

  add(data: Omit<Referral, 'id' | 'createdAt' | 'status' | 'notes'>): Referral {
    const newRef: Referral = {
      ...data,
      id: `ref-${Math.floor(100 + Math.random() * 900)}`,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      notes: []
    }
    this.referrals.unshift(newRef)
    return newRef
  }

  updateStatus(id: string, status: ReferralStatus): Referral | undefined {
    const ref = this.getById(id)
    if (!ref) return undefined
    ref.status = status
    return ref
  }

  addNote(id: string, author: string, text: string): Referral | undefined {
    const ref = this.getById(id)
    if (!ref) return undefined
    ref.notes.push({ author, text, timestamp: new Date().toLocaleTimeString() })
    return ref
  }
}

export const referralStore = new ReferralStore()
