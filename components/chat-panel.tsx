"use client";

import { FormEvent, useEffect, useState } from "react";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ConfigStatus = {
  ok: boolean;
  appName: string;
  defaultLocation: string;
  integrations: {
    accuweather: boolean;
    groq: boolean;
    hindsight: boolean;
  };
  missing: string[];
};

const starterMessages: Message[] = [
  {
    role: "system",
    content:
      "Configure the API keys in .env.local, then ask for current weather, a forecast, or advice such as what to wear, whether to travel, or how conditions compare with earlier questions."
  }
];

export function ChatPanel() {
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [location, setLocation] = useState("New Delhi");
  const [memoryHint, setMemoryHint] = useState(
    "The user likes practical travel and clothing guidance."
  );
  const [question, setQuestion] = useState(
    "Will I need an umbrella tomorrow morning?"
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/config")
      .then((response) => response.json())
      .then((data: ConfigStatus) => {
        setConfig(data);
        setLocation(data.defaultLocation);
      })
      .catch(() => {
        setConfig({
          ok: false,
          appName: "Weather AI",
          defaultLocation: "New Delhi",
          integrations: {
            accuweather: false,
            groq: false,
            hindsight: false
          },
          missing: ["Could not load runtime config."]
        });
      });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();
    const trimmedLocation = location.trim();
    const trimmedMemoryHint = memoryHint.trim();

    if (!trimmedQuestion || !trimmedLocation) {
      return;
    }

    const nextUserMessage: Message = {
      role: "user",
      content: `${trimmedQuestion}\n\nLocation: ${trimmedLocation}`
    };
    const history = [...messages, nextUserMessage].filter(
      (message): message is Exclude<Message, { role: "system" }> => message.role !== "system"
    );

    setMessages((current) => [...current, nextUserMessage]);
    setLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          location: trimmedLocation,
          memoryHint: trimmedMemoryHint,
          question: trimmedQuestion,
          history
        })
      });

      const data = (await response.json()) as {
        answer?: string;
        error?: string;
      };

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer ?? data.error ?? "No response returned."
        }
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected request failure.";
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `Request failed: ${message}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function resetConversation() {
    setMessages(starterMessages);
  }

  return (
    <section className="workspace">
      <aside className="panel">
        <h2>Control Panel</h2>
        <p>
          Use this browser panel to steer the agent, set a default city, and give it
          a user-profile hint that gets retained in memory.
        </p>

        <form className="settings-form">
          <div className="field">
            <label htmlFor="location">Default city</label>
            <input
              id="location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="New Delhi"
            />
          </div>

          <div className="field">
            <label htmlFor="memoryHint">Memory hint for Hindsight</label>
            <textarea
              id="memoryHint"
              value={memoryHint}
              onChange={(event) => setMemoryHint(event.target.value)}
            />
          </div>
        </form>

        {config ? (
          <>
            <div className="status-grid">
              <div className="status-card">
                <strong>App</strong>
                <span>{config.appName}</span>
              </div>
              <div className="status-card">
                <strong>Default city</strong>
                <span>{config.defaultLocation}</span>
              </div>
              <div className="status-card">
                <strong>AccuWeather</strong>
                <span>{config.integrations.accuweather ? "Connected" : "Missing key"}</span>
              </div>
              <div className="status-card">
                <strong>Groq + Hindsight</strong>
                <span>
                  {config.integrations.groq && config.integrations.hindsight
                    ? "Connected"
                    : "Setup needed"}
                </span>
              </div>
            </div>

            {config.missing.length > 0 ? (
              <div className="inline-note small">
                Missing config: {config.missing.join(", ")}
              </div>
            ) : null}
          </>
        ) : (
          <div className="inline-note small">Loading runtime config...</div>
        )}
      </aside>

      <section className="panel">
        <h3>Weather Agent</h3>
        <p>
          Ask about current weather, forecasts, alerts, travel timing, outdoor plans,
          or clothing suggestions. The agent will combine live retrieval with memory.
        </p>

        <div className="chat-log">
          {messages.map((message, index) => (
            <article className={`message ${message.role}`} key={`${message.role}-${index}`}>
              <div className="meta">{message.role}</div>
              {message.content}
            </article>
          ))}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="question">Question</label>
            <textarea
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
          </div>

          <div className="button-row">
            <button className="button" disabled={loading} type="submit">
              {loading ? "Thinking..." : "Ask Weather AI"}
            </button>
            <button className="button secondary" onClick={resetConversation} type="button">
              Reset chat
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}
