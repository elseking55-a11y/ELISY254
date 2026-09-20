import { useEffect, useState } from "react";
import "./styles.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

const NAV_ITEMS = [
  ["🏠", "Dashboard"],
  ["🤖", "My Bot"],
  ["⚡", "Auto Trade"],
  ["📡", "Signals"],
  ["✋", "Manual Trade"],
  ["📊", "Analysis"],
  ["🤖", "Available Bots"],
  ["📰", "News"],
  ["📜", "Trade History"],
  ["💼", "Portfolio"],
  ["⚙️", "Settings"]
];

function App() {
  const [screen, setScreen] = useState("splash");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");

  useEffect(() => {
    const savedUserId = sessionStorage.getItem("elisy254_user_id");

    if (savedUserId) {
      setUserId(savedUserId);
      setScreen("app");
    }
  }, []);

  useEffect(() => {
    if (screen === "splash") {
      const timer = setTimeout(() => {
        setScreen("key");
      }, 2600);

      return () => clearTimeout(timer);
    }
  }, [screen]);

  async function unlock() {
    const cleanKey = key.trim();

    if (!cleanKey) {
      setError("Enter your access key.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          key: cleanKey
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok || !data.userId) {
        setError(data.message || "Invalid access key.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem(
        "elisy254_user_id",
        data.userId
      );

      setUserId(data.userId);
      setKey("");
      setScreen("app");
    } catch (err) {
      setError(
        "Cannot connect to ELISY254 server. Check the API connection."
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("elisy254_user_id");
    setUserId("");
    setScreen("key");
    setActivePage("Dashboard");
  }

  if (screen === "splash") {
    return (
      <main className="splash-screen">
        <div className="splash-glow" />

        <div className="splash-content">
          <div className="brand-small">
            🔵 ELISY254
          </div>

          <h1>WELCOME TO ELISY254</h1>

          <div className="game-minded">
            GAME MINDED
          </div>

          <div className="brain-image" aria-label="Big Brain">
            🧠
          </div>

          <div className="big-brain">
            BIG BRAIN
          </div>

          <div className="loading-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      </main>
    );
  }

  if (screen === "key") {
    return (
      <main className="key-screen">
        <div className="key-background" />

        <section className="key-card">
          <div className="brand">
            🔵 ELISY254
          </div>

          <div className="key-brain">🧠</div>

          <h1>SHARP MINDED</h1>

          <p className="key-subtitle">
            Enter your private access key to open ELISY254.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              unlock();
            }}
          >
            <label htmlFor="access-key">
              ACCESS KEY
            </label>

            <input
              id="access-key"
              type="password"
              value={key}
              onChange={(event) => {
                setKey(event.target.value);
                setError("");
              }}
              placeholder="Enter access key"
              autoComplete="off"
              spellCheck="false"
              disabled={loading}
            />

            {error && (
              <div className="error-box">
                ⚠️ {error}
              </div>
            )}

            <button
              className="enter-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "VERIFYING..."
                : "ENTER SHARP MINDED →"}
            </button>
          </form>

          <div className="security-note">
            🔐 Your key is verified by the ELISY254 server.
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="top-header">
        <div className="logo">
          🔵 <span>ELISY254</span>
        </div>

        <div className="header-right">
          <span className="connection">
            🟢 SECURE
          </span>

          <button
            className="account-button"
            onClick={logout}
          >
            👤 Account
          </button>
        </div>
      </header>

      <nav className="horizontal-nav">
        {NAV_ITEMS.map(([icon, name]) => (
          <button
            key={name}
            className={
              activePage === name
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage(name)}
          >
            <span>{icon}</span>
            <span>{name}</span>
          </button>
        ))}
      </nav>

      <section className="content">
        <div className="page-title">
          <div>
            <span className="eyebrow">
              SHARP MINDED 😀 😎
            </span>
            <h2>{activePage}</h2>
          </div>

          <span className="live-badge">
            🟢 LIVE PLATFORM
          </span>
        </div>

        {activePage === "Dashboard" ? (
          <Dashboard userId={userId} />
        ) : (
          <ComingPage title={activePage} />
        )}
      </section>
    </main>
  );
}

function Dashboard({ userId }) {
  return (
    <>
      <div className="account-grid">
        <div className="dashboard-card">
          <div className="card-label">
            MT5 CONNECTION
          </div>
          <div className="card-value">
            🔴 NOT CONNECTED
          </div>
          <div className="card-small">
            Connect an MT5-compatible execution service
            before live trading.
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-label">
            ACTIVE BOT
          </div>
          <div className="card-value">
            ELISY254 ENGINE
          </div>
          <div className="card-small">
            Status: STOPPED
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-label">
            TRADING MODE
          </div>
          <div className="card-value">
            AUTO TRADE
          </div>
          <div className="card-small">
            Risk controls required before execution.
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-label">
            ANALYSIS
          </div>
          <div className="card-value">
            ENGINE
          </div>
          <div className="card-small">
            Built-in analysis mode.
          </div>
        </div>
      </div>

      <div className="main-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-icon">🔐</span>
            ACCOUNT RISK MANAGEMENT
          </div>

          <span className="status-pill">
            CONFIGURABLE
          </span>
        </div>

        <div className="risk-grid">
          <RiskItem name="Martingale" />
          <RiskItem name="Unlimited Recovery" />
          <RiskItem
            name="Maximum Daily Loss"
            enabled
          />
          <RiskItem
            name="Stop Loss"
            enabled
          />
          <RiskItem
            name="Trade-size Calculation"
            enabled
          />
          <RiskItem
            name="Margin Check"
            enabled
          />
          <RiskItem
            name="Maximum Positions"
            enabled
          />
        </div>

        <div className="risk-values">
          <div>
            <span>Risk Per Trade</span>
            <strong>0.50%</strong>
          </div>

          <div>
            <span>Daily Loss Limit</span>
            <strong>2.00%</strong>
          </div>

          <div>
            <span>Maximum Positions</span>
            <strong>1</strong>
          </div>
        </div>
      </div>

      <div className="main-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-icon">🧠</span>
            ELISY254 ENGINE
          </div>
        </div>

        <p className="panel-description">
          Account-aware trading engine. Live order
          execution remains blocked until a real MT5
          connection is verified.
        </p>

        <div className="warning-box">
          🔒 LIVE TRADING LOCKED — MT5 connection required.
        </div>
      </div>

      <div className="user-session">
        Session: {userId || "authenticated"}
      </div>
    </>
  );
}

function RiskItem({ name, enabled = false }) {
  return (
    <div className="risk-item">
      <span>{name}</span>

      <div
        className={
          enabled
            ? "toggle on"
            : "toggle"
        }
      >
        <span />
        <b>{enabled ? "ON" : "OFF"}</b>
      </div>
    </div>
  );
}

function ComingPage({ title }) {
  return (
    <div className="empty-panel">
      <div className="empty-icon">🔵</div>

      <h3>{title}</h3>

      <p>
        This module is part of the ELISY254 CLOUD
        architecture and will use real backend data.
      </p>

      <span>
        No fake trading data is being generated.
      </span>
    </div>
  );
}

export default App;
