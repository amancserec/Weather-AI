import { ChatPanel } from "@/components/chat-panel";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Hackathon-ready weather intelligence</p>
          <h1>Weather AI with live forecasts, persistent memory, and Groq-speed responses.</h1>
          <p className="hero-text">
            This agent uses AccuWeather as the live weather source, Hindsight Cloud to
            remember users and patterns, and Groq to answer quickly through a browser UI.
          </p>
          <div className="feature-strip">
            <span>Live AccuWeather retrieval</span>
            <span>Hindsight retain + recall</span>
            <span>Groq fast generation</span>
            <span>Launch checklist included</span>
          </div>
        </div>
        <div className="hero-card">
          <div className="status-badge">
            <span className="dot" />
            Browser control panel
          </div>
          <p>
            Ask for current weather, short-term forecasts, travel planning, alerts, or habit-aware
            advice like “Should I carry an umbrella to the office tomorrow?”
          </p>
          <ul className="hero-list">
            <li>Remembers user preferences and repeated questions</li>
            <li>Grounds every answer with fresh weather data</li>
            <li>Designed for quick deployment on Vercel</li>
          </ul>
        </div>
      </section>
      <ChatPanel />
    </main>
  );
}
