import { NextResponse } from 'next/server'
import { referralStore } from '@/lib/referralStore'
import { sendIntakeConfirmation } from '@/lib/email'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const specialistId = searchParams.get('specialistId')
  const all = await referralStore.getAll()
  const referrals = specialistId
    ? all.filter((r) => r.assignedSpecialistId === specialistId)
    : all
  return NextResponse.json({ referrals })
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
      rationale,
      assignedSpecialistId,
    } = body

    if (!patientName || !intakeText) {
      return NextResponse.json({ error: 'patientName and intakeText are required' }, { status: 400 })
    }

    const referral = await referralStore.add({
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
      rationale: rationale || '',
      assignedSpecialistId: assignedSpecialistId || undefined,
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
