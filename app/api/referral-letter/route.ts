import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY')
  return new GoogleGenAI({ apiKey })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { patientName, specialistType, bodyPart, symptoms, duration, painLevel, summary, rationale } = body

    if (!patientName || !specialistType) {
      return NextResponse.json({ error: 'patientName and specialistType are required' }, { status: 400 })
    }

    const prompt = [
      'You are a clinical assistant. Write a formal medical referral letter from a GP to the specialist.',
      'The letter should be concise, professional, and include: patient name, affected area, symptoms, duration, pain level, clinical summary, and the reason for referral.',
      'End with "Sincerely,\\nDr. [GP Name], MD".',
      '',
      `Patient: ${patientName}`,
      `Specialist type: ${specialistType}`,
      `Body part: ${bodyPart ?? 'not specified'}`,
      `Symptoms: ${symptoms ?? 'not specified'}`,
      `Duration: ${duration ?? 'not specified'}`,
      `Pain level: ${painLevel ?? 'not specified'}/10`,
      `Clinical summary: ${summary ?? 'not provided'}`,
      `Rationale: ${rationale ?? 'not provided'}`,
    ].join('\n')

    const ai = getClient()
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: { temperature: 0.3 },
    })

    const letter = response.text?.trim()
    if (!letter) throw new Error('Gemini returned an empty response')

    return NextResponse.json({ letter })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error generating referral letter'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
