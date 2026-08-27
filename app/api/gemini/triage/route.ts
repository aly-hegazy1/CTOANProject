import { NextResponse } from 'next/server'

import { triageIntake } from '@/lib/geminiClient'

type RequestBody = {
  intakeText?: string
  bodyPart?: string
  symptoms?: string
  duration?: string
  painLevel?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody

    if (!body.intakeText || typeof body.intakeText !== 'string') {
      return NextResponse.json(
        { error: 'intakeText is required' },
        { status: 400 },
      )
    }

    const triage = await triageIntake({
      intakeText: body.intakeText,
      bodyPart: body.bodyPart,
      symptoms: body.symptoms,
      duration: body.duration,
      painLevel: body.painLevel,
    })

    return NextResponse.json({ triage })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Gemini error'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}