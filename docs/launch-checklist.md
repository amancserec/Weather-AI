# Launch Checklist

## Product readiness

- Define the launch market: consumer weather assistant, student utility, travel planner, or business operations tool
- Finalize core user promise: "fast personalized weather decisions backed by live data"
- Decide one memorable demo story instead of showing every feature

## Technical readiness

- Confirm valid production API keys for AccuWeather, Groq, and Hindsight Cloud
- Add rate-limit handling and friendly fallback messages
- Add telemetry and error logging
- Add source links in the final answer card
- Add caching for repeated location lookups
- Add request validation and abuse protection

## Security and privacy

- Publish a privacy notice because Hindsight stores user-related context
- Avoid storing unnecessary personal data in memory
- Rotate API keys regularly
- Restrict CORS and protect server endpoints behind deployment controls

## Reliability

- Test missing-key behavior
- Test bad-city queries
- Test AccuWeather downtime fallback
- Test Hindsight downtime fallback
- Test Groq timeout behavior
- Test mobile layout before release

## Demo readiness

- Use a location with recognizable weather changes
- Preload one or two Hindsight memories for a stronger personalization moment
- Prepare a comparison question like "What changed since yesterday?"
- Keep one backup recorded walkthrough in case live APIs fail on demo day

## Business and judging alignment

- Innovation: emphasize grounded weather + memory instead of generic chatbot behavior
- Hindsight Memory: show retain, recall, and personalization clearly
- Technical Implementation: explain modular architecture and live APIs
- User Experience: demonstrate browser simplicity and fast response time
- Real-world Impact: anchor the story in commuting, travel, safety, or planning
