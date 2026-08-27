import { NextResponse } from 'next/server'
import { referralStore } from '@/lib/referralStore'
import { sendStatusUpdate } from '@/lib/email'

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params
  const referral = referralStore.getById(id)
  if (!referral) return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
  return NextResponse.json({ referral })
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params
    const body = await request.json()
    const { status, noteText, noteAuthor } = body

    let updated = referralStore.getById(id)
    if (!updated) return NextResponse.json({ error: 'Referral not found' }, { status: 404 })

    if (status) updated = referralStore.updateStatus(id, status)
    if (noteText) updated = referralStore.addNote(id, noteAuthor || 'Specialist', noteText)

    // Email patient on status change — non-blocking
    if (status && updated?.patientEmail) {
      sendStatusUpdate({
        to: updated.patientEmail,
        patientName: updated.patientName,
        referralId: updated.id,
        status,
        specialistNote: noteText,
      }).catch(() => {})
    }

    return NextResponse.json({ referral: updated })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error updating referral'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
