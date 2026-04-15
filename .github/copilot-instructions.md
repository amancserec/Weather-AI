# Copilot Workspace Instructions

## Project Summary
- This repo hosts `Weather AI`, a Next.js weather agent that uses AccuWeather, Hindsight Cloud, and Groq.
- The app is intended for hackathon judging and should stay easy to deploy.

## Commands
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Type check: `npm run typecheck`

## Conventions
- Keep API keys server-side only.
- Treat AccuWeather as the live source of truth.
- Use Hindsight for personalization and long-term memory, not as a replacement for live weather retrieval.
- Preserve the existing visual style unless the task specifically asks for redesign.
