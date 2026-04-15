import { formatWeatherSnapshot, getWeatherSnapshot } from "@/lib/accuweather";
import { env } from "@/lib/env";
import { groqChat } from "@/lib/groq";
import { recallMemories, retainMemory } from "@/lib/hindsight";

type RequestMessage = {
  role: "user" | "assistant";
  content: string;
};

type AgentInput = {
  question: string;
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  memoryHint?: string;
  history: RequestMessage[];
};

function formatHistory(history: RequestMessage[]) {
  return history
    .slice(-6)
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");
}

export async function answerWeatherQuestion(input: AgentInput) {
  const location = input.location || env.DEFAULT_LOCATION;
  const weather = await getWeatherSnapshot(location, input.coordinates);
  const weatherBrief = formatWeatherSnapshot(weather);

  const recallQuery = [input.memoryHint, input.question, location].filter(Boolean).join(" | ");
  const memories = await recallMemories(recallQuery);

  if (input.memoryHint) {
    await retainMemory(`User profile hint: ${input.memoryHint}`);
  }

  const answer = await groqChat([
    {
      role: "system",
      content:
        "You are Weather AI, a launch-ready weather operations assistant. Use the provided live weather data as the source of truth. Use memory only for personalization and context, never to override current weather facts. Be concise, practical, and action-oriented. If data is uncertain, say so."
    },
    {
      role: "user",
      content: [
        `User question: ${input.question}`,
        `Location: ${location}`,
        `Live weather data:\n${weatherBrief}`,
        memories.length > 0 ? `Relevant Hindsight memories:\n- ${memories.join("\n- ")}` : "",
        input.history.length > 0 ? `Recent conversation:\n${formatHistory(input.history)}` : "",
        "Answer with: 1) direct recommendation, 2) brief evidence from current conditions/forecast, 3) one follow-up suggestion if helpful."
      ]
        .filter(Boolean)
        .join("\n\n")
    }
  ]);

  await retainMemory(
    [
      `Location discussed: ${weather.locationLabel}.`,
      `User asked: ${input.question}`,
      `Answer summary: ${answer.slice(0, 800)}`
    ].join(" ")
  );

  return answer;
}
