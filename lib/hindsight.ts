import { env } from "@/lib/env";

type RecallResult = {
  results?: Array<{
    text?: string;
    content?: string;
  }>;
};

function getHeaders() {
  return {
    Authorization: `Bearer ${env.HINDSIGHT_API_KEY}`,
    "Content-Type": "application/json"
  };
}

function ensureHindsightKey() {
  if (!env.HINDSIGHT_API_KEY) {
    throw new Error("HINDSIGHT_API_KEY is missing. Add it to .env.local.");
  }
}

async function hindsightFetch(path: string, init: RequestInit) {
  ensureHindsightKey();

  const response = await fetch(`${env.HINDSIGHT_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...getHeaders(),
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Hindsight request failed with ${response.status}: ${detail}`);
  }

  return response;
}

export async function ensureBank() {
  try {
    await hindsightFetch(`/v1/default/banks/${env.HINDSIGHT_BANK_ID}`, {
      method: "GET"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (!message.includes("404")) {
      throw error;
    }

    await hindsightFetch("/v1/default/banks", {
      method: "POST",
      body: JSON.stringify({
        bank_id: env.HINDSIGHT_BANK_ID,
        name: "Weather AI",
        mission:
          "I am a weather intelligence agent. I remember user preferences, locations, routines, and forecast-relevant context while grounding final answers in fresh weather data.",
        disposition: {
          skepticism: 0.7,
          literalism: 0.5,
          empathy: 0.8
        }
      })
    });
  }
}

export async function retainMemory(content: string) {
  if (!env.HINDSIGHT_API_KEY) {
    return;
  }

  await ensureBank();

  await hindsightFetch(`/v1/default/banks/${env.HINDSIGHT_BANK_ID}/memories`, {
    method: "POST",
    body: JSON.stringify({
      items: [{ content }]
    })
  });
}

export async function recallMemories(query: string) {
  if (!env.HINDSIGHT_API_KEY) {
    return [];
  }

  await ensureBank();

  const response = await hindsightFetch(
    `/v1/default/banks/${env.HINDSIGHT_BANK_ID}/memories/recall`,
    {
      method: "POST",
      body: JSON.stringify({
        query
      })
    }
  );

  const data = (await response.json()) as RecallResult;

  return (data.results ?? [])
    .map((result) => result.text ?? result.content ?? "")
    .filter(Boolean)
    .slice(0, 6);
}
