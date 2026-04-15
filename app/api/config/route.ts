import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  const missing = [];

  if (!env.ACCUWEATHER_API_KEY) {
    missing.push("ACCUWEATHER_API_KEY");
  }

  if (!env.GROQ_API_KEY) {
    missing.push("GROQ_API_KEY");
  }

  if (!env.HINDSIGHT_API_KEY) {
    missing.push("HINDSIGHT_API_KEY");
  }

  return NextResponse.json({
    ok: missing.length === 0,
    appName: env.NEXT_PUBLIC_APP_NAME,
    defaultLocation: env.DEFAULT_LOCATION,
    integrations: {
      accuweather: Boolean(env.ACCUWEATHER_API_KEY),
      groq: Boolean(env.GROQ_API_KEY),
      hindsight: Boolean(env.HINDSIGHT_API_KEY)
    },
    missing
  });
}
