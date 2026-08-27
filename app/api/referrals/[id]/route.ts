import { NextResponse } from 'next/server'
import { referralStore } from '@/lib/referralStore'

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params
    const body = await request.json()
    const {
      status,
      assignedSpecialist,
      scheduledDate,
      noteText,
      noteAuthor,
      summary,
      referralLetter,
      specialistType,
      urgencyLevel
    } = body

    let updated = referralStore.getById(id)
    if (!updated) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
    }

    if (status) {
      updated = referralStore.updateStatus(id, status, {
        assignedSpecialist,
        scheduledDate
      })
    }

    if (
      summary !== undefined ||
      referralLetter !== undefined ||
      specialistType !== undefined ||
      urgencyLevel !== undefined
    ) {
      updated = referralStore.updateClinical(id, {
        summary,
        referralLetter,
        specialistType,
        urgencyLevel
      })
    }

    if (noteText) {
      updated = referralStore.addNote(id, noteAuthor || 'Clinician', noteText)
    }

    return NextResponse.json({ referral: updated })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error updating referral'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
