import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { context } = await request.json();

    const prompt = `You are the executive AI of a Global Planetary Dashboard. Review this real-world, real-time telemetry:
${JSON.stringify(context)}

Provide a strict 2-sentence executive status report summarizing the current state of the globe based ONLY on this data. Highlight any severe earthquakes, hazardous asteroids, or market anomalies. Keep it cinematic, professional, and highly concise. Do not use bullet points or intros. Just output the two sentences.`;

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        model: "google/gemma-2-2b-it",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        top_p: 0.7,
        max_tokens: 150,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from Nvidia API");
    }

    const data = await response.json();
    const summary = data.choices[0].message.content.trim();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary API error", error);
    return NextResponse.json({ error: "AI Intelligence Briefing offline." }, { status: 500 });
  }
}
