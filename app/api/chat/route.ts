import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const SYSTEM_PROMPT = `You are a helpful assistant for CareFlow OS, a medical referral and care coordination platform.
You help patients understand the referral process, answer questions about their care journey, and guide them through using the platform.

Key things you know:
- Patients can submit an intake form describing their symptoms and get matched with a specialist
- After submitting, they receive a tracking ID to follow their referral status
- There are 4 steps: Form Submitted → Reviewed by Specialist → Appointment Made → Medication Prescribed
- Patients can track their status at any time using their tracking ID

Be empathetic, concise, and helpful. Do not give specific medical diagnoses or replace professional medical advice.`

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json()

    if (!message) return NextResponse.json({ error: 'message is required' }, { status: 400 })

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 })

    const ai = new GoogleGenAI({ apiKey })

    const contents = [
      ...(history ?? []),
      { role: 'user', parts: [{ text: message }] },
    ]

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    })

    const reply = response.text?.trim() ?? 'Sorry, I could not generate a response.'
    return NextResponse.json({ reply })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Chat error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
