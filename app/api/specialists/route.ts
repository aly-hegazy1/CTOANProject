import { NextResponse } from 'next/server'
import { specialistStore } from '@/lib/specialistStore'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const specialty = searchParams.get('specialty')
  const specialists = specialty
    ? specialistStore.getBySpecialty(specialty)
    : specialistStore.getAll()
  return NextResponse.json({ specialists })
}

export async function POST(request: Request) {
  try {
    const { name, specialty, hospital } = await request.json()
    if (!name || !specialty || !hospital) {
      return NextResponse.json(
        { error: 'name, specialty, and hospital are required' },
        { status: 400 }
      )
    }
    const specialist = specialistStore.findOrCreate(name, specialty, hospital)
    return NextResponse.json({ specialist })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
