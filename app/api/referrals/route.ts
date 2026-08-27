import { NextResponse } from 'next/server'
import { referralStore } from '@/lib/referralStore'
import { sendIntakeConfirmation } from '@/lib/email'

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
      patientEmail: patientEmail || '',
      bodyPart: bodyPart || 'general',
      symptoms: symptoms || intakeText,
      duration: duration || 'unknown',
      painLevel: painLevel || '5',
      intakeText,
      urgencyLevel: urgencyLevel || 'yellow',
      specialistType: specialistType || 'General Practice',
      summary: summary || 'AI intake summary pending.',
      referralLetter: referralLetter || '',
      rationale: rationale || ''
    })

    // Send confirmation email — non-blocking, don't fail the request if it errors
    if (patientEmail) {
      sendIntakeConfirmation({
        to: patientEmail,
        patientName: referral.patientName,
        referralId: referral.id,
        specialistType: referral.specialistType,
        urgencyLevel: referral.urgencyLevel,
      }).catch(() => {})
    }

    return NextResponse.json({ referral })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error creating referral'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
