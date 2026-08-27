import { GoogleGenAI } from '@google/genai'

export type TriageResult = {
  urgencyLevel: 'red' | 'yellow' | 'green'
  specialistType: string
  summary: string
  referralLetter: string
  rationale: string
}

type TriageInput = {
  intakeText: string
  bodyPart?: string
  symptoms?: string
  duration?: string
  painLevel?: string
}

const triageSchema = {
  type: 'object',
  properties: {
    urgencyLevel: { type: 'string', enum: ['red', 'yellow', 'green'] },
    specialistType: { type: 'string' },
    summary: { type: 'string' },
    referralLetter: { type: 'string' },
    rationale: { type: 'string' },
  },
  required: ['urgencyLevel', 'specialistType', 'summary', 'referralLetter', 'rationale'],
} as const

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY')
  }

  return new GoogleGenAI({ apiKey })
}

function buildPrompt(input: TriageInput) {
  return [
    'You are a clinical intake triage assistant for a care coordination platform.',
    'Classify the referral into urgency and specialist type, then produce a concise summary and referral letter.',
    'Use body part, symptoms, duration, and pain level when deciding urgency and the specialist type.',
    'Return specialistType values that are useful for routing: orthopedics, cardiology, dermatology, neurology, gastroenterology, or primary care.',
    'Return only valid JSON that matches the provided schema.',
    '',
    `Body part: ${input.bodyPart ?? 'not specified'}`,
    `Symptoms: ${input.symptoms ?? 'not specified'}`,
    `Duration: ${input.duration ?? 'not specified'}`,
    `Pain level: ${input.painLevel ?? 'not specified'}`,
    `Intake text: ${input.intakeText}`,
  ].join('\n')
}

export async function triageIntake(input: TriageInput): Promise<TriageResult> {
  const ai = getGeminiClient()
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: buildPrompt(input),
    config: {
      responseMimeType: 'application/json',
      responseSchema: triageSchema,
      temperature: 0.2,
    },
  })

  const rawText = response.text?.trim()

  if (!rawText) {
    throw new Error('Gemini returned an empty response')
  }

  return JSON.parse(rawText) as TriageResult
}