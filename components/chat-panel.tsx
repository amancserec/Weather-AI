"use client";

import { FormEvent, useEffect, useState } from "react";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  contextTag?: string;
};

type Coordinates = {
  latitude: number;
  longitude: number;
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
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
  const [locationPopupMessage, setLocationPopupMessage] = useState(
    "Allow access to your location so Weather AI can use GPS coordinates for a more accurate forecast."
  );
  const [memoryHint, setMemoryHint] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/config")
      .then((response) => response.json())
      .then((data: ConfigStatus) => {
        setConfig(data);
      })
      .catch(() => {
        setConfig({
          ok: false,
          appName: "Weather AI",
          defaultLocation: "",
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
    const hasCoordinates =
      coordinates !== null &&
      Number.isFinite(coordinates.latitude) &&
      Number.isFinite(coordinates.longitude);

    if (!trimmedQuestion || (!trimmedLocation && !hasCoordinates)) {
      return;
    }

    const nextUserMessage: Message = {
      role: "user",
      content: `${trimmedQuestion}\n\nLocation: ${
        hasCoordinates
          ? `GPS (${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)})`
          : trimmedLocation
      }`
    };
    const responseLocationTag = hasCoordinates
      ? "Location source: GPS"
      : "Location source: typed city";
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
          latitude: hasCoordinates ? coordinates.latitude : undefined,
          longitude: hasCoordinates ? coordinates.longitude : undefined,
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
          content: data.answer ?? data.error ?? "No response returned.",
          contextTag: responseLocationTag
        }
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected request failure.";
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `Request failed: ${message}`,
          contextTag: responseLocationTag
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function resetConversation() {
    setMessages(starterMessages);
  }

  function handleUseCurrentLocation() {
    setLocationPopupMessage(
      "Allow access to your location so Weather AI can use GPS coordinates for a more accurate forecast."
    );
    setIsLocationPopupOpen(true);
  }

  function requestCurrentLocation() {
    setIsLocationPopupOpen(false);

    if (!("geolocation" in navigator)) {
      setLocationStatus("Geolocation is not supported in this browser.");
      return;
    }

    setIsLocating(true);
    setLocationStatus("Requesting location access...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        setCoordinates(nextCoordinates);
        setLocation(
          `${nextCoordinates.latitude.toFixed(4)}, ${nextCoordinates.longitude.toFixed(4)}`
        );
        setLocationStatus("Using your current GPS location for more accurate weather.");
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);

        if (error.code === error.PERMISSION_DENIED) {
          const deniedMessage =
            "Location access was denied. You can still type a city manually.";
          setLocationStatus(deniedMessage);
          setLocationPopupMessage(deniedMessage);
          setIsLocationPopupOpen(true);
          return;
        }

        const fallbackMessage =
          "Could not detect your location. Please try again or enter a city.";
        setLocationStatus(fallbackMessage);
        setLocationPopupMessage(fallbackMessage);
        setIsLocationPopupOpen(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
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
              onChange={(event) => {
                setLocation(event.target.value);
                setCoordinates(null);
                setLocationStatus("");
              }}
              placeholder="Enter a city or use my location"
            />
            <button
              className="button secondary"
              onClick={handleUseCurrentLocation}
              type="button"
              disabled={isLocating}
            >
              {isLocating ? "Detecting location..." : "Use my location"}
            </button>
            {locationStatus ? <div className="inline-note small info-note">{locationStatus}</div> : null}
          </div>

          <div className="field">
            <label htmlFor="memoryHint">Memory hint for Hindsight</label>
            <textarea
              id="memoryHint"
              value={memoryHint}
              onChange={(event) => setMemoryHint(event.target.value)}
              placeholder="Add an optional memory hint"
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
                <span>{config.defaultLocation || "Not set"}</span>
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
              {message.contextTag ? <div className="pill small">{message.contextTag}</div> : null}
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
              placeholder="Ask a weather question"
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

      {isLocationPopupOpen ? (
        <div
          className="modal-backdrop"
          onClick={() => setIsLocationPopupOpen(false)}
          role="presentation"
        >
          <div
            aria-modal="true"
            className="modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h4>Location access</h4>
            <p>{locationPopupMessage}</p>
            <div className="button-row">
              {locationPopupMessage.startsWith("Allow access") ? (
                <button className="button" onClick={requestCurrentLocation} type="button">
                  Allow location access
                </button>
              ) : null}
              <button
                className="button secondary"
                onClick={() => setIsLocationPopupOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
