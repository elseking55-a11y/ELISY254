import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/$/, "");

function App() {
  const [screen, setScreen] = useState("splash");
  const [accessKey, setAccessKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen("landing");
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  async function enterPlatform() {
    const key = accessKey.trim();

    if (!key) {
      setError("Enter your private access key.");
      return;
    }

    if (!API_URL) {
      setError("Backend address is not configured.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/key`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            key
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data.message || "Access verification failed."
        );
      }

      if (data.token) {
        sessionStorage.setItem(
          "elisy_token",
          data.token
        );
      }

      if (data.user?.id) {
        sessionStorage.setItem(
          "elisy_user_id",
          data.user.id
        );
      }

      setScreen("dashboard");
    } catch (err) {
      setError(
        err.message ||
        "Backend is currently unavailable. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (screen === "splash") {
    return (
      <div className="splash">
        <div className="brain">🧠</div>

        <h1>WELCOME TO ELISY254</h1>

        <p>GAME MINDED</p>

        <div className="loading-line">
          <span />
        </div>
      </div>
    );
  }

  if (screen === "landing") {
    return (
      <main className="landing">
        <nav className="landing-nav">
          <div className="logo">
            ELISY254 <span>CLOUD</span>
          </div>

          <div className="nav-status">
            ● CLOUD PLATFORM
          </div>
        </nav>

        <section className="hero">
          <div className="hero-content">
            <div className="brain-large">🧠</div>

            <p className="eyebrow">
              SHARP MINDED
            </p>

            <h1>
              TRADE SMART.
              <br />
              CONTROL YOUR RISK.
            </h1>

            <p className="hero-text">
              ELISY254 CLOUD connects your trading
              dashboard to your configured MT5
              infrastructure.
            </p>

            <div className="access-box">
              <label>
                PRIVATE ACCESS
              </label>

              <input
                type="password"
                value={accessKey}
                onChange={(e) =>
                  setAccessKey(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    enterPlatform();
                  }
                }}
                placeholder="Enter access key"
                autoComplete="off"
              />

              <button
                onClick={enterPlatform}
                disabled={loading}
              >
                {loading
                  ? "CONNECTING..."
                  : "ENTER ELISY254 →"}
              </button>

              {error && (
                <div className="error">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-glow" />

            <div className="terminal-card">
              <div className="terminal-top">
                <span>ELISY254 ENGINE</span>
                <span className="offline">
                  ● STANDBY
                </span>
              </div>

              <div className="terminal-body">
                <div>
                  <small>MT5</small>
                  <strong>WAITING</strong>
                </div>

                <div>
                  <small>ANALYSIS</small>
                  <strong>ENGINE</strong>
                </div>

                <div>
                  <small>RISK</small>
                  <strong>PROTECTED</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <div>
            🤖
            <strong>ENGINE</strong>
            <span>Built-in market analysis</span>
          </div>

          <div>
            📊
            <strong>ANALYSIS</strong>
            <span>Engine or AI modes</span>
          </div>

          <div>
            🛡️
            <strong>RISK CONTROL</strong>
            <span>Account-aware protection</span>
          </div>

          <div>
            📡
            <strong>MT5 CLOUD</strong>
            <span>Cloud connection</span>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "dashboard") {
    return <Dashboard />;
  }

  return null;
}

function Dashboard() {
  return (
    <main className="app">
      <header className="app-header">
        <div className="logo">
          ELISY254 <span>CLOUD</span>
        </div>

        <div className="connection">
          <span>●</span>
          MT5 NOT CONNECTED
        </div>
      </header>

      <nav className="top-nav">
        {[
          "🏠 Dashboard",
          "🤖 My Bot",
          "⚡ Auto Trade",
          "📡 Signals",
          "✋ Manual Trade",
          "📊 Analysis",
          "🤖 Available Bots",
          "📰 News",
          "📜 Trade History",
          "💼 Portfolio",
          "⚙️ Settings"
        ].map((item) => (
          <button key={item}>
            {item}
          </button>
        ))}
      </nav>

      <section className="dashboard">
        <div className="welcome">
          <p>ELISY254 CLOUD</p>
          <h1>Dashboard</h1>
          <span>
            Connect your MT5 account to begin.
          </span>
        </div>

        <div className="cards">
          <Card
            title="Balance"
            value="—"
            label="Waiting for MT5"
          />

          <Card
            title="Equity"
            value="—"
            label="Waiting for MT5"
          />

          <Card
            title="Free Margin"
            value="—"
            label="Waiting for MT5"
          />

          <Card
            title="Margin Level"
            value="—"
            label="Waiting for MT5"
          />
        </div>

        <div className="status-grid">
          <div className="status-card">
            <h3>MT5 CONNECTION</h3>
            <strong>NOT CONNECTED</strong>
            <p>
              No trading action is available until
              a real MT5 connection is verified.
            </p>
          </div>

          <div className="status-card">
            <h3>TRADING MODE</h3>
            <strong>MANUAL</strong>
            <p>
              Automatic trading remains disabled
              until the account and risk checks pass.
            </p>
          </div>

          <div className="status-card">
            <h3>ANALYSIS MODE</h3>
            <strong>ENGINE</strong>
            <p>
              Built-in analysis does not require an
              external AI API.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({ title, value, label }) {
  return (
    <div className="card">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
