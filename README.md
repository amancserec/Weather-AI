# Weather AI

Weather AI is a web-controlled weather agent built for hackathon judging around innovation, Hindsight Memory usage, technical quality, UX, and real-world impact.

The app combines:

- AccuWeather for live weather retrieval and forecasts
- Hindsight Cloud for persistent user/context memory
- Groq for fast LLM inference
- Next.js for a simple deployable web interface

## What this project does

This is not a model that is "trained on AccuWeather." Instead, it uses a stronger production pattern:

- fresh weather data is fetched from AccuWeather at request time
- the LLM reasons over live weather context
- Hindsight stores user preferences, prior interactions, and recurring patterns

That keeps answers current while still making the agent feel personalized over time.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`.

3. Add these keys:

- `ACCUWEATHER_API_KEY`
- `GROQ_API_KEY`
- `HINDSIGHT_API_KEY`

4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Required environment variables

| Variable | Purpose |
| --- | --- |
| `ACCUWEATHER_API_KEY` | Live weather and forecast retrieval |
| `GROQ_API_KEY` | Fast LLM completions |
| `HINDSIGHT_API_KEY` | Memory retain/recall operations |
| `HINDSIGHT_BANK_ID` | Memory bank ID for the app |
| `HINDSIGHT_BASE_URL` | Defaults to Hindsight Cloud API |
| `GROQ_MODEL` | Defaults to `llama-3.3-70b-versatile` |
| `DEFAULT_LOCATION` | Browser UI default city |
| `NEXT_PUBLIC_APP_NAME` | App branding |

## Architecture

- `app/page.tsx`: main landing page and control UI
- `app/api/agent/route.ts`: weather agent entrypoint
- `lib/accuweather.ts`: location search, current conditions, forecast retrieval
- `lib/hindsight.ts`: Hindsight Cloud memory creation, retain, and recall
- `lib/groq.ts`: Groq chat completion wrapper
- `lib/agent.ts`: orchestration logic

## Deployment

This app is structured for Vercel deployment:

1. Push to GitHub
2. Import the repo into Vercel
3. Add the same environment variables
4. Deploy

See [docs/launch-checklist.md](docs/launch-checklist.md) and [docs/demo-script.md](docs/demo-script.md) for launch and demo preparation.
