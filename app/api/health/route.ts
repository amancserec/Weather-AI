import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    services: {
      accuweatherConfigured: Boolean(env.ACCUWEATHER_API_KEY),
      groqConfigured: Boolean(env.GROQ_API_KEY),
      hindsightConfigured: Boolean(env.HINDSIGHT_API_KEY)
    }
  });
}
