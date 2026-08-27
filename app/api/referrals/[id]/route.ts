import { NextResponse } from 'next/server'
import { referralStore } from '@/lib/referralStore'

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

    return NextResponse.json({ referral: updated })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error updating referral'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
