import { NextResponse } from 'next/server'
import { referralStore } from '@/lib/referralStore'

export async function GET() {
  return NextResponse.json({ referrals: referralStore.getAll() })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      patientName,
      patientEmail,
      bodyPart,
      symptoms,
      duration,
      painLevel,
      intakeText,
      urgencyLevel,
      specialistType,
      summary,
      referralLetter,
      rationale
    } = body

    if (!patientName || !intakeText) {
      return NextResponse.json({ error: 'patientName and intakeText are required' }, { status: 400 })
    }

    const referral = referralStore.add({
      patientName,
      patientEmail: patientEmail || 'patient@example.com',
      bodyPart: bodyPart || 'general',
      symptoms: symptoms || intakeText,
      duration: duration || 'unknown',
      painLevel: painLevel || '5',
      intakeText,
      urgencyLevel: urgencyLevel || 'yellow',
      specialistType: specialistType || 'Orthopedics',
      summary: summary || 'AI intake summary pending.',
      referralLetter: referralLetter || 'Draft referral summary.',
      rationale: rationale || 'Standard routing.'
    })

    return NextResponse.json({ referral })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error creating referral'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
