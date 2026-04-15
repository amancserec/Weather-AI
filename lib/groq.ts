import { env } from "@/lib/env";

type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function groqChat(messages: GroqMessage[]) {
  if (!env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to .env.local.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 700,
      messages
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Groq request failed with ${response.status}: ${detail}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Groq returned an empty answer.");
  }

  return content;
}
