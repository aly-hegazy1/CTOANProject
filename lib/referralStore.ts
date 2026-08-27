export type ReferralStatus = 'submitted' | 'reviewed' | 'accepted' | 'scheduled'
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
  assignedSpecialist?: string
  scheduledDate?: string
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
    referralLetter: 'Dear Orthopedic Specialist,\n\nPatient Jordan Patel presents with acute knee trauma sustained during athletic activity, exhibiting mechanical locking and an inability to achieve full extension. Findings suggest acute meniscal pathology or ligamentous injury. Immediate clinical evaluation and MRI are strongly recommended.\n\nSincerely,\nDr. Alex Vance, MD',
    rationale: 'Mechanical locking combined with acute trauma and high pain score indicates potential displaced meniscus tear requiring urgent specialist evaluation.',
    status: 'reviewed',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    assignedSpecialist: 'Dr. Sarah Jenkins, Ortho',
    notes: [
      { author: 'Dr. Vance (GP)', text: 'Reviewed initial intake and attached triage summary.', timestamp: '1 hour ago' }
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
    referralLetter: 'Dear Orthopedic Specialist,\n\nElena Rostova presents with a 6-month history of subacromial impingement symptoms. Conservative physical therapy has provided minimal relief. Requesting specialist consultation for diagnostic ultrasound and consideration of cortisone injection.\n\nSincerely,\nDr. Alex Vance, MD',
    rationale: 'Chronic duration without acute red flags warrants subspecialty outpatient evaluation within standard triage timeframes.',
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

  updateStatus(id: string, status: ReferralStatus, extra?: { assignedSpecialist?: string; scheduledDate?: string }): Referral | undefined {
    const ref = this.getById(id)
    if (!ref) return undefined
    ref.status = status
    if (extra?.assignedSpecialist !== undefined) ref.assignedSpecialist = extra.assignedSpecialist
    if (extra?.scheduledDate !== undefined) ref.scheduledDate = extra.scheduledDate
    return ref
  }

  updateClinical(
    id: string,
    updates: Partial<Pick<Referral, 'summary' | 'referralLetter' | 'specialistType' | 'urgencyLevel'>>
  ): Referral | undefined {
    const ref = this.getById(id)
    if (!ref) return undefined
    if (updates.summary !== undefined) ref.summary = updates.summary
    if (updates.referralLetter !== undefined) ref.referralLetter = updates.referralLetter
    if (updates.specialistType !== undefined) ref.specialistType = updates.specialistType
    if (updates.urgencyLevel !== undefined) ref.urgencyLevel = updates.urgencyLevel
    return ref
  }

  addNote(id: string, author: string, text: string): Referral | undefined {
    const ref = this.getById(id)
    if (!ref) return undefined
    ref.notes.push({
      author,
      text,
      timestamp: 'Just now'
    })
    return ref
  }
}

export const referralStore = new ReferralStore()
