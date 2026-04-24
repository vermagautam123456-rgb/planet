import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json();

    const systemPrompt = `You are "NVIDIA Core", the AI Assistant for the Global Planetary Dashboard. 
You are receiving real-time telemetry from multiple planetary systems (Flights, Weather, ISS, Earthquakes, Crypto, Air Quality, Asteroids, etc).
Here is the current live data context:
${JSON.stringify(context)}

The user will ask you questions. Use ONLY this data to answer them. Be concise, highly professional, analytical, and futuristic in your tone. 
If the user mentions voice recognition or microphone errors, explain that the Tactical Voice Interface (TVI) requires a stable network uplink for its cloud-based processing. Advise them to wait for the red "UPLINK_LOST" indicator to clear or to use this terminal for manual command entry.
Do not use markdown headers; use plain text or bullet points if needed.`;

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        model: "google/gemma-2-2b-it",
        messages: [
          { role: "user", content: `${systemPrompt}\n\nUser Question: ${message}` }
        ],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 1024,
        stream: false
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("NVIDIA API Error:", err);
      throw new Error("Failed to fetch from Nvidia API");
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error", error);
    return NextResponse.json({ error: "Telemetric analysis offline." }, { status: 500 });
  }
}
