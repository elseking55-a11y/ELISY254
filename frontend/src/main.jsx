import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://elisy254-sharp-mvfi.onrender.com";

const USER_TOKEN_KEY = "elisy254_user_token";
const ADMIN_TOKEN_KEY = "elisy254_admin_token";

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
  ["⚙️", "Settings"],
];

const ADMIN_NAV_ITEMS = [
  ["🏠", "Dashboard"],
  ["👥", "Users"],
  ["🤖", "Bot Management"],
  ["📡", "MT5 Accounts"],
  ["⚡", "Trading Activity"],
  ["📊", "Analysis / AI"],
  ["🔑", "Access Keys"],
  ["🛡️", "Risk Controls"],
  ["💰", "Portfolio / Accounts"],
  ["📜", "Trade History"],
  ["📰", "News"],
  ["⚙️", "System Settings"],
  ["🔐", "Admin Security"],
];

async function apiRequest(path, options = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "—";

  const number = Number(value);

  if (!Number.isFinite(number)) return String(value);

  return number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function maskAccount(account) {
  if (!account) return "—";

  const value = String(account);

  if (value.length <= 4) return "••••";

  return `${"•".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
}

function StatusDot({ online = false }) {
  return (
    <span className={`status-dot ${online ? "online" : "offline"}`}>
      <span />
    </span>
  );
}

function PageTitle({ icon, title, description }) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">{icon} ELISY254 CLOUD</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

function InfoCard({ title, value, label, icon, status }) {
  return (
    <div className="info-card">
      <div className="info-card-top">
        <span className="info-icon">{icon}</span>
        {status !== undefined && <StatusDot online={status} />}
      </div>

      <div className="info-card-title">{title}</div>

      <div className="info-card-value">{value}</div>

      {label && <div className="info-card-label">{label}</div>}
    </div>
  );
}

function StateRow({ label, value, status }) {
  return (
    <div className="state-row">
      <span>{label}</span>

      <strong className={status ? "state-online" : ""}>
        {status !== undefined && (
          <StatusDot online={status} />
        )}
        {value}
      </strong>
    </div>
  );
}

/* =========================================================
   SPLASH
========================================================= */

function Splash({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-screen">
      <div className="splash-brain">🧠</div>

      <h1>WELCOME TO ELISY254</h1>

      <p>GAME MINDED</p>

      <div className="splash-loader">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

/* =========================================================
   LANDING
========================================================= */

function Landing({ onLogin }) {
  const [accessKey, setAccessKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();

    if (!accessKey.trim()) {
      setError("Enter your private access key.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/auth/key", {
        method: "POST",
        body: JSON.stringify({
          accessKey: accessKey.trim(),
        }),
      });

      if (!result?.token) {
        throw new Error("Access service did not return a valid session.");
      }

      sessionStorage.setItem(USER_TOKEN_KEY, result.token);

      onLogin(result);
    } catch (err) {
      setError(
        err.message ||
          "The access service is temporarily unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="landing-page">
      <div className="landing-glow glow-one" />
      <div className="landing-glow glow-two" />

      <section className="landing-card">
        <div className="landing-brain">🧠</div>

        <div className="landing-badge">
          <StatusDot online={true} />
          CLOUD PLATFORM
        </div>

        <h1>WELCOME TO ELISY254</h1>

        <h2>
          SHARP MINDED <span>😀 😎</span>
        </h2>

        <p className="landing-description">
          Private cloud trading platform with MT5 connectivity,
          analysis tools, bots and risk controls.
        </p>

        <form onSubmit={submit} className="access-form">
          <label>PRIVATE ACCESS KEY</label>

          <input
            type="password"
            value={accessKey}
            onChange={(event) => setAccessKey(event.target.value)}
            placeholder="Enter your access key"
            autoComplete="off"
          />

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "VERIFYING..." : "ENTER ELISY254"}
          </button>

          {error && (
            <div className="error-box">
              🔴 {error}
            </div>
          )}
        </form>

        <div className="landing-status">
          <span>
            <StatusDot online={true} />
            CLOUD
          </span>

          <span>
            <StatusDot online={false} />
            MT5
          </span>
        </div>

        <a
          href="/admin"
          className="admin-link"
          onClick={() => {
            sessionStorage.removeItem(ADMIN_TOKEN_KEY);
          }}
        >
          🔐 Admin Login
        </a>
      </section>
    </main>
  );
}

/* =========================================================
   USER HEADER
========================================================= */

function UserHeader({
  user,
  onLogout,
  cloudOnline,
  mt5Online,
}) {
  return (
    <header className="top-header">
      <div className="brand">
        <span className="brand-icon">🧠</span>

        <div>
          <strong>ELISY254</strong>
          <small>CLOUD</small>
        </div>
      </div>

      <div className="header-status">
        <span>
          <StatusDot online={cloudOnline} />
          CLOUD {cloudOnline ? "ONLINE" : "OFFLINE"}
        </span>

        <span>
          <StatusDot online={mt5Online} />
          MT5 {mt5Online ? "CONNECTED" : "OFFLINE"}
        </span>
      </div>

      <div className="header-actions">
        {user?.email && (
          <span className="header-user">
            {user.email}
          </span>
        )}

        <button
          className="small-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

/* =========================================================
   USER NAVIGATION
========================================================= */

function UserNavigation({ active, setActive }) {
  return (
    <nav className="horizontal-nav">
      {NAV_ITEMS.map(([icon, label]) => (
        <button
          key={label}
          className={active === label ? "active" : ""}
          onClick={() => setActive(label)}
        >
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </nav>
  );
}

/* =========================================================
   USER PANELS
========================================================= */

function HomePanel({
  user,
  mt5,
  cloudOnline,
}) {
  const connected = Boolean(mt5?.connected);

  return (
    <>
      <PageTitle
        icon="🏠"
        title="Dashboard"
        description="Your ELISY254 CLOUD control center."
      />

      <div className="card-grid">
        <InfoCard
          icon="☁️"
          title="Cloud"
          value={cloudOnline ? "ONLINE" : "OFFLINE"}
          label="Backend status"
          status={cloudOnline}
        />

        <InfoCard
          icon="📡"
          title="MT5"
          value={connected ? "CONNECTED" : "NOT CONNECTED"}
          label="Real broker connection"
          status={connected}
        />

        <InfoCard
          icon="💰"
          title="Balance"
          value={connected ? formatNumber(mt5.balance) : "—"}
          label={connected ? mt5.currency || "Account" : "No live data"}
        />

        <InfoCard
          icon="📊"
          title="Equity"
          value={connected ? formatNumber(mt5.equity) : "—"}
          label={connected ? mt5.currency || "Account" : "No live data"}
        />
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="panel-header">
            <h3>Connection</h3>
            <span className={connected ? "pill green" : "pill red"}>
              {connected ? "CONNECTED" : "NOT CONNECTED"}
            </span>
          </div>

          <StateRow
            label="Account"
            value={
              connected
                ? maskAccount(mt5.account)
                : "Not connected"
            }
          />

          <StateRow
            label="Broker"
            value={connected ? mt5.broker || "—" : "—"}
          />

          <StateRow
            label="Server"
            value={connected ? mt5.server || "—" : "—"}
          />

          <StateRow
            label="Currency"
            value={connected ? mt5.currency || "—" : "—"}
          />

          <StateRow
            label="Free Margin"
            value={
              connected
                ? formatNumber(mt5.freeMargin)
                : "—"
            }
          />
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Trading State</h3>
          </div>

          <StateRow
            label="User"
            value={user?.email || "Authenticated"}
          />

          <StateRow
            label="Trading Mode"
            value="MANUAL"
          />

          <StateRow
            label="Analysis Mode"
            value="ENGINE"
          />

          <StateRow
            label="Active Bot"
            value="ELISY254 ENGINE"
          />

          <div className="warning-box">
            ⚠️ Real MT5 data is shown only after a verified
            broker connection.
          </div>
        </section>
      </div>
    </>
  );
}

function MyBotPanel() {
  return (
    <>
      <PageTitle
        icon="🤖"
        title="My Bot"
        description="Manage the bot currently selected for your account."
      />

      <section className="panel bot-panel">
        <div className="bot-main">
          <div className="bot-icon">🤖</div>

          <div>
            <h2>ELISY254 ENGINE</h2>
            <p>
              Built-in analysis and risk-controlled trading
              engine.
            </p>

            <span className="pill green">AVAILABLE</span>
          </div>
        </div>

        <div className="control-grid">
          <StateRow label="Version" value="1.0" />
          <StateRow label="Status" value="ACTIVE" />
          <StateRow label="Mode" value="ENGINE" />
          <StateRow label="Martingale" value="OFF" />
        </div>
      </section>
    </>
  );
}

function AutoTradePanel() {
  const [enabled, setEnabled] = useState(false);

  return (
    <>
      <PageTitle
        icon="⚡"
        title="Auto Trade"
        description="Automatic trading requires a verified MT5 connection."
      />

      <section className="panel">
        <div className="auto-trade-header">
          <div>
            <h2>Automatic Trading</h2>
            <p>
              The backend must validate account ownership,
              margin, risk limits and broker execution before
              a real order is allowed.
            </p>
          </div>

          <button
            className={`toggle ${enabled ? "on" : ""}`}
            onClick={() => setEnabled((value) => !value)}
            type="button"
          >
            <span />
          </button>
        </div>

        <div className="risk-grid">
          <StateRow label="Engine" value="READY" />
          <StateRow label="Risk Check" value="REQUIRED" />
          <StateRow label="MT5" value="NOT CONNECTED" />
          <StateRow label="Trading" value={enabled ? "ARMED" : "OFF"} />
        </div>

        <div className="warning-box">
          ⚠️ Turning this switch on does not bypass backend
          risk protection or broker validation.
        </div>
      </section>
    </>
  );
}

function SignalsPanel() {
  return (
    <>
      <PageTitle
        icon="📡"
        title="Signals"
        description="Analysis signals appear here when available."
      />

      <section className="panel empty-panel">
        <div className="empty-icon">📡</div>
        <h2>No live signal</h2>
        <p>
          No verified market signal is currently available.
        </p>
      </section>
    </>
  );
}

function ManualTradePanel() {
  const [symbol, setSymbol] = useState("EURUSD");
  const [volume, setVolume] = useState("0.01");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function trade(side) {
    const token = sessionStorage.getItem(USER_TOKEN_KEY);

    if (!token) {
      setMessage("Please login again.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await apiRequest(
        "/api/trade",
        {
          method: "POST",
          body: JSON.stringify({
            symbol,
            volume: Number(volume),
            side,
          }),
        },
        token
      );

      setMessage(
        result?.message ||
          "Trade request was processed by the backend."
      );
    } catch (err) {
      setMessage(
        err.message ||
          "Trade was not executed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageTitle
        icon="✋"
        title="Manual Trade"
        description="Manual orders are sent to the backend for validation."
      />

      <section className="panel">
        <div className="trade-form">
          <div>
            <label>SYMBOL</label>

            <input
              value={symbol}
              onChange={(event) =>
                setSymbol(event.target.value.toUpperCase())
              }
            />
          </div>

          <div>
            <label>VOLUME</label>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={volume}
              onChange={(event) =>
                setVolume(event.target.value)
              }
            />
          </div>
        </div>

        <div className="trade-buttons">
          <button
            className="trade-buy"
            disabled={loading}
            onClick={() => trade("BUY")}
          >
            BUY
          </button>

          <button
            className="trade-sell"
            disabled={loading}
            onClick={() => trade("SELL")}
          >
            SELL
          </button>
        </div>

        {message && (
          <div className="info-box">
            {message}
          </div>
        )}

        <div className="warning-box">
          ⚠️ The backend must confirm MT5 connectivity and
          all risk checks before executing a real order.
        </div>
      </section>
    </>
  );
}

function AnalysisPanel() {
  const [mode, setMode] = useState("ENGINE");
  const [provider, setProvider] = useState("ChatGPT");

  return (
    <>
      <PageTitle
        icon="📊"
        title="Analysis"
        description="Choose the analysis engine used by the platform."
      />

      <section className="panel">
        <h3>Analysis Mode</h3>

        <div className="mode-buttons">
          <button
            className={mode === "ENGINE" ? "selected" : ""}
            onClick={() => setMode("ENGINE")}
          >
            ⚙️ ENGINE
          </button>

          <button
            className={mode === "AI" ? "selected" : ""}
            onClick={() => setMode("AI")}
          >
            🧠 AI
          </button>
        </div>

        {mode === "ENGINE" ? (
          <div className="analysis-box">
            <h3>⚙️ ELISY254 ENGINE</h3>

            <p>
              Built-in analysis does not require an external AI
              provider.
            </p>

            <div className="analysis-list">
              <span>✓ Market structure</span>
              <span>✓ Trend analysis</span>
              <span>✓ Risk checks</span>
              <span>✓ Broker validation</span>
            </div>
          </div>
        ) : (
          <div className="analysis-box">
            <h3>🧠 AI PROVIDER</h3>

            <select
              value={provider}
              onChange={(event) =>
                setProvider(event.target.value)
              }
            >
              <option>ChatGPT</option>
              <option>Gemini</option>
              <option>Cloud AI</option>
              <option>DeepSeek</option>
            </select>

            <p>
              AI API keys should remain on the backend and
              should never be exposed in the browser.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function AvailableBotsPanel() {
  return (
    <>
      <PageTitle
        icon="🤖"
        title="Available Bots"
        description="Bots published by the ELISY254 administrator."
      />

      <section className="bot-list">
        <div className="available-bot">
          <div className="bot-icon">🤖</div>

          <div className="available-bot-content">
            <h3>ELISY254 ENGINE</h3>

            <p>
              Built-in trading analysis and risk engine.
            </p>

            <span className="pill green">PUBLISHED</span>
          </div>

          <button className="primary-button small">
            SELECT
          </button>
        </div>

        <div className="empty-panel compact">
          <div className="empty-icon">➕</div>
          <p>
            New published bots will appear here automatically.
          </p>
        </div>
      </section>
    </>
  );
}

function PortfolioPanel() {
  return (
    <>
      <PageTitle
        icon="💼"
        title="Portfolio"
        description="Your verified account portfolio information."
      />

      <section className="panel empty-panel">
        <div className="empty-icon">💼</div>

        <h2>MT5 not connected</h2>

        <p>
          Portfolio values will appear after a real MT5
          connection is verified.
        </p>
      </section>
    </>
  );
}

function SettingsPanel() {
  const settings = [
    ["Martingale", "OFF"],
    ["Unlimited Recovery", "OFF"],
    ["Maximum Daily Loss", "ON"],
    ["Stop Loss", "ON"],
    ["Take Profit", "ON"],
    ["Margin Check", "ON"],
    ["Maximum Positions", "ON"],
    ["Execution Verification", "ON"],
  ];

  return (
    <>
      <PageTitle
        icon="⚙️"
        title="Settings"
        description="Risk and platform settings."
      />

      <section className="panel">
        <h3>Risk Controls</h3>

        <div className="settings-list">
          {settings.map(([label, value]) => (
            <div className="setting-row" key={label}>
              <span>{label}</span>
              <span
                className={
                  value === "ON"
                    ? "pill green"
                    : "pill red"
                }
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="warning-box">
          🛡️ Safety controls are enforced by the backend.
          Frontend switches are not security controls.
        </div>
      </section>
    </>
  );
}

function SimplePanel({ icon, title, description }) {
  return (
    <>
      <PageTitle
        icon={icon}
        title={title}
        description={description}
      />

      <section className="panel empty-panel">
        <div className="empty-icon">{icon}</div>

        <h2>{title}</h2>

        <p>
          This section is ready for backend data and future
          platform features.
        </p>
      </section>
    </>
  );
}

/* =========================================================
   USER APP
========================================================= */

function UserApp({ onLogout }) {
  const [active, setActive] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [mt5, setMt5] = useState(null);
  const [cloudOnline, setCloudOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = sessionStorage.getItem(USER_TOKEN_KEY);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!token) {
        onLogout();
        return;
      }

      try {
        const [me, health] = await Promise.all([
          apiRequest("/api/auth/me", {}, token),
          apiRequest("/api/health"),
        ]);

        if (!mounted) return;

        setUser(me?.user || me || null);
        setCloudOnline(Boolean(health));

        try {
          const mt5Status = await apiRequest(
            "/api/mt5/status",
            {},
            token
          );

          if (mounted) {
            setMt5(mt5Status);
          }
        } catch {
          if (mounted) {
            setMt5({
              connected: false,
            });
          }
        }
      } catch {
        if (mounted) {
          setCloudOnline(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [token, onLogout]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <section className="loading-panel">
          <div className="loading-spinner" />
          <h2>Loading ELISY254 CLOUD...</h2>
          <p>Checking your secure session.</p>
        </section>
      );
    }

    switch (active) {
      case "Dashboard":
        return (
          <HomePanel
            user={user}
            mt5={mt5}
            cloudOnline={cloudOnline}
          />
        );

      case "My Bot":
        return <MyBotPanel />;

      case "Auto Trade":
        return <AutoTradePanel />;

      case "Signals":
        return <SignalsPanel />;

      case "Manual Trade":
        return <ManualTradePanel />;

      case "Analysis":
        return <AnalysisPanel />;

      case "Available Bots":
        return <AvailableBotsPanel />;

      case "News":
        return (
          <SimplePanel
            icon="📰"
            title="News"
            description="Platform and market news."
          />
        );

      case "Trade History":
        return (
          <SimplePanel
            icon="📜"
            title="Trade History"
            description="Verified trading history from your account."
          />
        );

      case "Portfolio":
        return <PortfolioPanel />;

      case "Settings":
        return <SettingsPanel />;

      default:
        return null;
    }
  }, [active, user, mt5, cloudOnline, loading]);

  return (
    <div className="app-shell">
      <UserHeader
        user={user}
        onLogout={onLogout}
        cloudOnline={cloudOnline}
        mt5Online={Boolean(mt5?.connected)}
      />

      <UserNavigation
        active={active}
        setActive={setActive}
      />

      <main className="main-content">
        {content}
      </main>
    </div>
  );
}

/* =========================================================
   ADMIN LOGIN
========================================================= */

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!result?.token) {
        throw new Error("Admin service did not return a token.");
      }

      sessionStorage.setItem(
        ADMIN_TOKEN_KEY,
        result.token
      );

      onLogin(result);
    } catch (err) {
      setError(
        err.message ||
          "Admin login failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-glow" />

      <section className="admin-login-card">
        <div className="admin-lock">🔐</div>

        <div className="landing-badge">
          <StatusDot online={true} />
          ADMIN CONTROL
        </div>

        <h1>ELISY254 ADMIN</h1>

        <p>
          Secure administrator access to the cloud platform.
        </p>

        <form
          className="access-form"
          onSubmit={submit}
        >
          <label>ADMIN EMAIL</label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Admin email"
            autoComplete="username"
          />

          <label>ADMIN PASSWORD</label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Admin password"
            autoComplete="current-password"
          />

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "AUTHENTICATING..." : "ADMIN LOGIN"}
          </button>

          {error && (
            <div className="error-box">
              🔴 {error}
            </div>
          )}
        </form>

        <a href="/" className="admin-link">
          ← Return to ELISY254 CLOUD
        </a>
      </section>
    </main>
  );
}

/* =========================================================
   ADMIN HEADER
========================================================= */

function AdminHeader({ onLogout }) {
  return (
    <header className="admin-header">
      <div className="brand">
        <span className="brand-icon">🔐</span>

        <div>
          <strong>ELISY254</strong>
          <small>ADMIN</small>
        </div>
      </div>

      <div className="admin-header-center">
        <StatusDot online={true} />
        ADMIN CONTROL PANEL
      </div>

      <button
        className="small-button"
        onClick={onLogout}
      >
        Logout
      </button>
    </header>
  );
}

/* =========================================================
   ADMIN NAVIGATION
========================================================= */

function AdminNavigation({ active, setActive }) {
  return (
    <nav className="horizontal-nav admin-nav">
      {ADMIN_NAV_ITEMS.map(([icon, label]) => (
        <button
          key={label}
          className={active === label ? "active" : ""}
          onClick={() => setActive(label)}
        >
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </nav>
  );
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({ data }) {
  const stats = data?.stats || data || {};

  return (
    <>
      <PageTitle
        icon="🏠"
        title="Admin Dashboard"
        description="Real platform information from the backend."
      />

      <div className="card-grid">
        <InfoCard
          icon="☁️"
          title="Cloud"
          value="ONLINE"
          label="Backend reachable"
          status={true}
        />

        <InfoCard
          icon="👥"
          title="Users"
          value={
            stats.users ??
            stats.totalUsers ??
            "—"
          }
          label="Registered users"
        />

        <InfoCard
          icon="📡"
          title="MT5 Accounts"
          value={
            stats.mt5Accounts ??
            stats.connectedMT5 ??
            "—"
          }
          label="Backend records"
        />

        <InfoCard
          icon="🤖"
          title="Bots"
          value={
            stats.bots ??
            stats.activeBots ??
            "—"
          }
          label="Bot records"
        />

        <InfoCard
          icon="⚡"
          title="Trades Today"
          value={
            stats.tradesToday ??
            "—"
          }
          label="Verified records"
        />

        <InfoCard
          icon="❌"
          title="Failed Orders"
          value={
            stats.failedOrders ??
            "—"
          }
          label="Recorded failures"
        />

        <InfoCard
          icon="🧠"
          title="AI Requests"
          value={
            stats.aiRequests ??
            "—"
          }
          label="Backend records"
        />

        <InfoCard
          icon="🔑"
          title="Access Keys"
          value={
            stats.accessKeys ??
            "—"
          }
          label="Backend records"
        />
      </div>

      <section className="panel">
        <div className="panel-header">
          <h3>System State</h3>

          <span className="pill green">
            BACKEND CONNECTED
          </span>
        </div>

        <StateRow
          label="Trading"
          value={
            stats.tradingEnabled === true
              ? "ENABLED"
              : "DISABLED"
          }
        />

        <StateRow
          label="MT5 Provider"
          value={
            stats.mt5Provider ||
            "Not configured"
          }
        />

        <StateRow
          label="AI"
          value={
            stats.aiEnabled === true
              ? "ENABLED"
              : "CONFIGURATION DEPENDENT"
          }
        />

        <StateRow
          label="Environment"
          value={
            stats.environment ||
            "Production"
          }
        />
      </section>

      <div className="warning-box">
        🛡️ Numbers are displayed only when supplied by the
        backend. The frontend does not invent users, trades,
        balances or MT5 connections.
      </div>
    </>
  );
}

/* =========================================================
   ADMIN SECTION
========================================================= */

function AdminSection({ title, icon, description }) {
  return (
    <>
      <PageTitle
        icon={icon}
        title={title}
        description={description}
      />

      <section className="admin-feature-grid">
        <div className="admin-feature-card">
          <div className="feature-icon">{icon}</div>

          <h3>{title}</h3>

          <p>
            This administration section is ready for
            backend-managed data and controls.
          </p>

          <span className="pill green">
            ADMIN ONLY
          </span>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>System Information</h3>
          </div>

          <StateRow
            label="Source"
            value="Backend"
          />

          <StateRow
            label="Authentication"
            value="Admin JWT"
          />

          <StateRow
            label="Frontend"
            value="Vercel"
          />

          <StateRow
            label="Backend"
            value="Render"
          />
        </div>
      </section>
    </>
  );
}

/* =========================================================
   ADMIN APP
========================================================= */

function AdminApp({ onLogout }) {
  const [active, setActive] = useState("Dashboard");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      if (!token) {
        onLogout();
        return;
      }

      try {
        const result = await apiRequest(
          "/api/admin/dashboard",
          {},
          token
        );

        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.message ||
              "Could not load admin dashboard."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [token, onLogout]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <section className="loading-panel">
          <div className="loading-spinner" />
          <h2>Loading Admin Panel...</h2>
          <p>Checking administrator session.</p>
        </section>
      );
    }

    if (error) {
      return (
        <section className="panel">
          <div className="error-box">
            🔴 {error}
          </div>

          <p>
            The admin frontend is running, but the backend
            admin endpoint did not return dashboard data.
          </p>
        </section>
      );
    }

    switch (active) {
      case "Dashboard":
        return <AdminDashboard data={data} />;

      case "Users":
        return (
          <AdminSection
            icon="👥"
            title="Users"
            description="View and manage registered platform users."
          />
        );

      case "Bot Management":
        return (
          <AdminSection
            icon="🤖"
            title="Bot Management"
            description="Create, publish, edit and disable trading bots."
          />
        );

      case "MT5 Accounts":
        return (
          <AdminSection
            icon="📡"
            title="MT5 Accounts"
            description="Monitor verified MT5 account connections."
          />
        );

      case "Trading Activity":
        return (
          <AdminSection
            icon="⚡"
            title="Trading Activity"
            description="Monitor backend trading activity and execution results."
          />
        );

      case "Analysis / AI":
        return (
          <AdminSection
            icon="📊"
            title="Analysis / AI"
            description="Manage engine and AI analysis configuration."
          />
        );

      case "Access Keys":
        return (
          <AdminSection
            icon="🔑"
            title="Access Keys"
            description="Manage platform access credentials."
          />
        );

      case "Risk Controls":
        return (
          <AdminSection
            icon="🛡️"
            title="Risk Controls"
            description="Configure backend-enforced trading safety limits."
          />
        );

      case "Portfolio / Accounts":
        return (
          <AdminSection
            icon="💰"
            title="Portfolio / Accounts"
            description="Monitor verified account information."
          />
        );

      case "Trade History":
        return (
          <AdminSection
            icon="📜"
            title="Trade History"
            description="Review recorded trading activity."
          />
        );

      case "News":
        return (
          <AdminSection
            icon="📰"
            title="News"
            description="Manage platform news and announcements."
          />
        );

      case "System Settings":
        return (
          <AdminSection
            icon="⚙️"
            title="System Settings"
            description="Manage platform-level configuration."
          />
        );

      case "Admin Security":
        return (
          <AdminSection
            icon="🔐"
            title="Admin Security"
            description="Administrator authentication and security controls."
          />
        );

      default:
        return null;
    }
  }, [active, data, loading, error]);

  return (
    <div className="app-shell admin-shell">
      <AdminHeader onLogout={onLogout} />

      <AdminNavigation
        active={active}
        setActive={setActive}
      />

      <main className="main-content">
        {content}
      </main>
    </div>
  );
}

/* =========================================================
   APP ROUTER
========================================================= */

function App() {
  const [splash, setSplash] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(
    Boolean(sessionStorage.getItem(USER_TOKEN_KEY))
  );

  const [adminLoggedIn, setAdminLoggedIn] = useState(
    Boolean(sessionStorage.getItem(ADMIN_TOKEN_KEY))
  );

  const isAdminRoute =
    window.location.pathname.startsWith("/admin");

  const finishSplash = () => {
    setSplash(false);
  };

  function userLogout() {
    sessionStorage.removeItem(USER_TOKEN_KEY);
    setUserLoggedIn(false);
  }

  function adminLogout() {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminLoggedIn(false);

    if (window.location.pathname !== "/admin") {
      window.history.pushState({}, "", "/admin");
    }
  }

  function userLogin() {
    setUserLoggedIn(true);
  }

  function adminLogin() {
    setAdminLoggedIn(true);

    if (window.location.pathname !== "/admin/dashboard") {
      window.history.pushState(
        {},
        "",
        "/admin/dashboard"
      );
    }
  }

  if (splash && !isAdminRoute) {
    return <Splash onFinish={finishSplash} />;
  }

  if (isAdminRoute) {
    if (!adminLoggedIn) {
      return <AdminLogin onLogin={adminLogin} />;
    }

    return <AdminApp onLogout={adminLogout} />;
  }

  if (!userLoggedIn) {
    return <Landing onLogin={userLogin} />;
  }

  return <UserApp onLogout={userLogout} />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
