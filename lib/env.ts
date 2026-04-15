export const env = {
  ACCUWEATHER_API_KEY: process.env.ACCUWEATHER_API_KEY?.trim() ?? "",
  GROQ_API_KEY: process.env.GROQ_API_KEY?.trim() ?? "",
  HINDSIGHT_API_KEY: process.env.HINDSIGHT_API_KEY?.trim() ?? "",
  HINDSIGHT_BANK_ID: process.env.HINDSIGHT_BANK_ID?.trim() || "weather-ai-main",
  HINDSIGHT_BASE_URL:
    process.env.HINDSIGHT_BASE_URL?.trim() || "https://api.hindsight.vectorize.io",
  GROQ_MODEL: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
  DEFAULT_LOCATION: process.env.DEFAULT_LOCATION?.trim() ?? "",
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Weather AI"
};
