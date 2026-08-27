import { supabase } from './supabaseClient'

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
  assignedSpecialistId?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toReferral(row: any): Referral {
  return {
    id: row.id,
    patientName: row.patient_name,
    patientEmail: row.patient_email,
    bodyPart: row.body_part,
    symptoms: row.symptoms,
    duration: row.duration,
    painLevel: row.pain_level,
    intakeText: row.intake_text,
    urgencyLevel: row.urgency_level,
    specialistType: row.specialist_type,
    summary: row.summary,
    referralLetter: row.referral_letter ?? '',
    rationale: row.rationale ?? '',
    status: row.status,
    createdAt: row.created_at,
    notes: row.notes ?? [],
    assignedSpecialistId: row.assigned_specialist_id ?? undefined,
  }
}

class ReferralStore {
  async getAll(): Promise<Referral[]> {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(toReferral)
  }

  async getById(id: string): Promise<Referral | undefined> {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return undefined
    return toReferral(data)
  }

  async add(data: Omit<Referral, 'id' | 'createdAt' | 'status' | 'notes'>): Promise<Referral> {
    const id = `ref-${Math.random().toString(36).slice(2, 8)}`
    const { data: inserted, error } = await supabase
      .from('referrals')
      .insert({
        id,
        patient_name: data.patientName,
        patient_email: data.patientEmail || '',
        body_part: data.bodyPart,
        symptoms: data.symptoms,
        duration: data.duration,
        pain_level: data.painLevel,
        intake_text: data.intakeText,
        urgency_level: data.urgencyLevel,
        specialist_type: data.specialistType,
        summary: data.summary,
        referral_letter: data.referralLetter || '',
        rationale: data.rationale || '',
        status: 'submitted',
        assigned_specialist_id: data.assignedSpecialistId ?? null,
        notes: [],
      })
      .select()
      .single()
    if (error) throw error
    return toReferral(inserted)
  }

  async updateStatus(id: string, status: ReferralStatus): Promise<Referral | undefined> {
    const { data, error } = await supabase
      .from('referrals')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    if (error) return undefined
    return toReferral(data)
  }

  async addNote(id: string, author: string, text: string): Promise<Referral | undefined> {
    const referral = await this.getById(id)
    if (!referral) return undefined
    const updatedNotes = [
      ...referral.notes,
      { author, text, timestamp: new Date().toLocaleTimeString() },
    ]
    const { data, error } = await supabase
      .from('referrals')
      .update({ notes: updatedNotes })
      .eq('id', id)
      .select()
      .single()
    if (error) return undefined
    return toReferral(data)
  }
}

export const referralStore = new ReferralStore()
