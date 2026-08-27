import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Extract the new fields along with the old ones
    const { 
      age, 
      height, 
      weight, 
      intakeText, 
      bodyPart, 
      duration, 
      painLevel, 
      location, 
      insurance, 
      symptoms 
    } = body

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 })
    }

    // Instruct Gemini, injecting the demographics directly into the prompt
    const prompt = `
      You are an AI medical triage and referral assistant. Analyze this patient intake data:
      
      Patient Profile:
      Age: ${age}
      Height: ${height}
      Weight: ${weight}
      
      Complaint & Details:
      Patient Input: "${intakeText}"
      Body Part: ${bodyPart}
      Symptoms: ${symptoms}
      Duration: ${duration}
      Pain Level: ${painLevel}/10
      Patient Location: ${location}
      Patient Insurance: ${insurance}

      Tasks:
      1. Determine urgencyLevel: "Red" (Immediate/ER), "Yellow" (Urgent Specialist within days), or "Green" (Routine).
      2. Determine the specialistType needed (e.g., "Orthopedics", "Cardiology", "Dermatology").
      3. Write a brief, professional clinical summary. Use the age, weight, and height to provide context (e.g., "34-year-old patient presenting with...").
      4. Based on the location (${location}) and insurance (${insurance}), recommend 2-3 realistic medical clinics or providers that match this specialty. (If you don't know exact real ones, generate highly realistic sounding clinics for that specific city/zip).

      Respond ONLY with a valid JSON object matching this exact structure, with no markdown formatting or backticks:
      {
        "urgencyLevel": "Yellow",
        "specialistType": "Orthopedics",
        "summary": "34-year-old patient reports...",
        "providers": [
          {
            "name": "City Orthopedic Specialists",
            "address": "123 Medical Way, [City]",
            "matchReason": "In-network with ${insurance}"
          }
        ]
      }
    `

    // Uses the latest Gemini 2.5 Flash model
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2, // Low temp for more consistent JSON structure
            responseMimeType: "application/json", // Force JSON output
          },
        }),
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error("Gemini API Error:", errorText)
      return NextResponse.json({ error: "Failed to generate triage result." }, { status: 500 })
    }

    const geminiData = await geminiResponse.json()
    
    // Extract the JSON string from Gemini's response
    const rawText = geminiData.candidates[0].content.parts[0].text
    const parsedData = JSON.parse(rawText)

    // Send the structured data back to the frontend
    return NextResponse.json(parsedData)

  } catch (error) {
    console.error("Triage Error:", error)
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    )
  }
}