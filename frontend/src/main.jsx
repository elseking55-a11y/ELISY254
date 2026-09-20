import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

/* =========================================================
   ELISY254 CLOUD
   REAL FRONTEND
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://elisy254-sharp-mvfi.onrender.com";

/* =========================================================
   API HELPER
========================================================= */

async function apiRequest(
  path,
  options = {}
) {
  const token =
    sessionStorage.getItem("elisy_user_token");

  const headers = {
    ...(options.body
      ? {
          "Content-Type":
            "application/json"
        }
      : {}),
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        `Request failed (HTTP ${response.status})`
    );

    error.code =
      data?.code || "REQUEST_FAILED";

    error.status =
      response.status;

    throw error;
  }

  return data;
}

/* =========================================================
   ACCESS KEY
========================================================= */

async function verifyAccessKey(
  accessKey
) {
  const value =
    String(accessKey || "").trim();

  if (!value) {
    throw new Error(
      "Enter your access key."
    );
  }

  const response =
    await fetch(
      `${API_URL}/api/auth/key`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          accessKey: value
        })
      }
    );

  let data;

  try {
    data =
      await response.json();
  } catch {
    throw new Error(
      `The cloud returned HTTP ${response.status}.`
    );
  }

  if (
    !response.ok ||
    !data?.ok
  ) {
    throw new Error(
      data?.message ||
        `Access verification failed (HTTP ${response.status}).`
    );
  }

  if (!data.token) {
    throw new Error(
      "The cloud verified the key but did not return a session."
    );
  }

  sessionStorage.setItem(
    "elisy_user_token",
    data.token
  );

  return data;
}

/* =========================================================
   CLOUD HEALTH
========================================================= */

async function getCloudHealth() {
  return apiRequest(
    "/api/health"
  );
}

/* =========================================================
   REAL MT5 STATUS
========================================================= */

async function getMT5Status() {
  return apiRequest(
    "/api/mt5/status"
  );
}

/* =========================================================
   ICON NAV
========================================================= */

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

/* =========================================================
   SPLASH
========================================================= */

function Splash({
  onFinished
}) {
  useEffect(() => {
    const timer =
      setTimeout(() => {
        onFinished();
      }, 1800);

    return () =>
      clearTimeout(timer);
  }, [onFinished]);

  return (
    <div className="splash-screen">
      <div className="brain-large">
        🧠
      </div>

      <h1>
        ELISY254
      </h1>

      <div className="splash-title">
        CLOUD
      </div>

      <p>
        GAME MINDED
      </p>
    </div>
  );
}

/* =========================================================
   LANDING
========================================================= */

function Landing({
  onVerified
}) {
  const [
    accessKey,
    setAccessKey
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    cloudStatus,
    setCloudStatus
  ] = useState("CHECKING");

  useEffect(() => {
    let active = true;

    getCloudHealth()
      .then((data) => {
        if (!active) return;

        setCloudStatus(
          data?.backend?.status ===
            "online"
            ? "ONLINE"
            : "OFFLINE"
        );
      })
      .catch(() => {
        if (!active) return;
        setCloudStatus("OFFLINE");
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleAccess() {
    setError("");

    if (!accessKey.trim()) {
      setError(
        "Enter your access key."
      );
      return;
    }

    setLoading(true);

    try {
      const result =
        await verifyAccessKey(
          accessKey
        );

      onVerified(result);
    } catch (err) {
      setError(
        err.message ||
          "Access verification failed."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event
  ) {
    if (
      event.key === "Enter" &&
      !loading
    ) {
      handleAccess();
    }
  }

  return (
    <main className="landing-page">

      <div className="landing-glow" />

      <section className="landing-card">

        <div className="brain-large">
          🧠
        </div>

        <div className="brand-small">
          ELISY254
        </div>

        <h1>
          WELCOME TO
          <br />
          ELISY254
        </h1>

        <div className="game-minded">
          GAME MINDED
        </div>

        <p className="landing-description">
          SHARP MINDED 😀 😎
        </p>

        <div className="cloud-status-row">

          <span
            className={
              cloudStatus ===
              "ONLINE"
                ? "status-dot online"
                : cloudStatus ===
                  "OFFLINE"
                ? "status-dot offline"
                : "status-dot checking"
            }
          />

          <span>
            {cloudStatus ===
            "ONLINE"
              ? "CLOUD ONLINE"
              : cloudStatus ===
                "OFFLINE"
              ? "CLOUD OFFLINE"
              : "CHECKING CLOUD..."}
          </span>

        </div>

        <div className="access-box">

          <label>
            PRIVATE ACCESS
          </label>

          <input
            type="password"
            value={accessKey}
            onChange={(event) => {
              setAccessKey(
                event.target.value
              );
              setError("");
            }}
            onKeyDown={
              handleKeyDown
            }
            placeholder="Enter access key"
            autoComplete="off"
          />

          <button
            onClick={
              handleAccess
            }
            disabled={loading}
          >
            {loading
              ? "VERIFYING..."
              : "ENTER ELISY254 →"}
          </button>

        </div>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <div className="real-platform-note">
          REAL CLOUD PLATFORM
          <br />
          No simulated MT5 account
        </div>

      </section>

    </main>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  type,
  children
}) {
  return (
    <span
      className={`status-badge ${type}`}
    >
      <span className="status-dot" />
      {children}
    </span>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  onLogout
}) {
  const [
    activeNav,
    setActiveNav
  ] = useState("Dashboard");

  const [
    cloudOnline,
    setCloudOnline
  ] = useState(false);

  const [
    mt5Connected,
    setMT5Connected
  ] = useState(false);

  const [
    mt5Account,
    setMT5Account
  ] = useState(null);

  const [
    tradingEnabled,
    setTradingEnabled
  ] = useState(false);

  const [
    loadingStatus,
    setLoadingStatus
  ] = useState(true);

  const [
    statusError,
    setStatusError
  ] = useState("");

  const [
    tradingMode,
    setTradingMode
  ] = useState("AUTO TRADE");

  const [
    analysisMode,
    setAnalysisMode
  ] = useState("ENGINE");

  const [
    selectedSymbol,
    setSelectedSymbol
  ] = useState(
    "XAUUSD"
  );

  const [
    selectedBot,
    setSelectedBot
  ] = useState(
    "ELISY254 ENGINE"
  );

  const [
    riskEnabled,
    setRiskEnabled
  ] = useState(true);

  /* -------------------------------------------------------
     REAL CLOUD + MT5 CHECK
  ------------------------------------------------------- */

  async function refreshStatus() {
    try {
      setLoadingStatus(true);
      setStatusError("");

      const [
        health,
        mt5
      ] = await Promise.all([
        getCloudHealth(),
        getMT5Status()
      ]);

      setCloudOnline(
        health?.backend?.status ===
          "online"
      );

      setTradingEnabled(
        health?.trading?.enabled ===
          true
      );

      setMT5Connected(
        mt5?.connected ===
          true &&
        mt5?.status ===
          "CONNECTED"
      );

      setMT5Account(
        mt5?.account || null
      );
    } catch (error) {
      console.error(error);

      setCloudOnline(false);
      setMT5Connected(false);
      setMT5Account(null);

      setStatusError(
        error.message ||
          "Unable to check cloud status."
      );
    } finally {
      setLoadingStatus(false);
    }
  }

  useEffect(() => {
    refreshStatus();

    const interval =
      setInterval(
        refreshStatus,
        15000
      );

    return () =>
      clearInterval(
        interval
      );
  }, []);

  /* -------------------------------------------------------
     REAL TRADING PERMISSION
  ------------------------------------------------------- */

  const canTrade =
    cloudOnline &&
    mt5Connected &&
    tradingEnabled &&
    riskEnabled;

  function handleLogout() {
    sessionStorage.removeItem(
      "elisy_user_token"
    );

    window.location.href =
      "/";
  }

  function renderContent() {
    switch (activeNav) {
      case "My Bot":
        return (
          <MyBotPanel
            selectedBot={
              selectedBot
            }
            setSelectedBot={
              setSelectedBot
            }
            mt5Connected={
              mt5Connected
            }
          />
        );

      case "Auto Trade":
        return (
          <AutoTradePanel
            enabled={
              canTrade
            }
            mt5Connected={
              mt5Connected
            }
            tradingEnabled={
              tradingEnabled
            }
          />
        );

      case "Signals":
        return (
          <SignalsPanel
            mt5Connected={
              mt5Connected
            }
            symbol={
              selectedSymbol
            }
          />
        );

      case "Manual Trade":
        return (
          <ManualTradePanel
            mt5Connected={
              mt5Connected
            }
            canTrade={
              canTrade
            }
            symbol={
              selectedSymbol
            }
          />
        );

      case "Analysis":
        return (
          <AnalysisPanel
            mode={
              analysisMode
            }
            setMode={
              setAnalysisMode
            }
            symbol={
              selectedSymbol
            }
          />
        );

      case "Available Bots":
        return (
          <AvailableBotsPanel
            selectedBot={
              selectedBot
            }
            setSelectedBot={
              setSelectedBot
            }
          />
        );

      case "News":
        return (
          <SimplePanel
            title="📰 News"
            text="Market news will appear here when connected to a real news source."
          />
        );

      case "Trade History":
        return (
          <SimplePanel
            title="📜 Trade History"
            text="Real broker-confirmed trades will appear here."
          />
        );

      case "Portfolio":
        return (
          <PortfolioPanel
            connected={
              mt5Connected
            }
            account={
              mt5Account
            }
          />
        );

      case "Settings":
        return (
          <SettingsPanel
            tradingMode={
              tradingMode
            }
            setTradingMode={
              setTradingMode
            }
            analysisMode={
              analysisMode
            }
            setAnalysisMode={
              setAnalysisMode
            }
            riskEnabled={
              riskEnabled
            }
            setRiskEnabled={
              setRiskEnabled
            }
          />
        );

      default:
        return (
          <HomePanel
            cloudOnline={
              cloudOnline
            }
            mt5Connected={
              mt5Connected
            }
            mt5Account={
              mt5Account
            }
            tradingEnabled={
              tradingEnabled
            }
            selectedSymbol={
              selectedSymbol
            }
            setSelectedSymbol={
              setSelectedSymbol
            }
            selectedBot={
              selectedBot
            }
            tradingMode={
              tradingMode
            }
            analysisMode={
              analysisMode
            }
            canTrade={
              canTrade
            }
          />
        );
    }
  }

  return (
    <div className="app-shell">

      {/* TOP HEADER */}

      <header className="top-header">

        <div className="brand">

          <span className="brand-brain">
            🧠
          </span>

          <div>
            <strong>
              ELISY254
            </strong>

            <small>
              CLOUD
            </small>
          </div>

        </div>

        <div className="header-status">

          <StatusBadge
            type={
              cloudOnline
                ? "good"
                : "bad"
            }
          >
            {cloudOnline
              ? "CLOUD ONLINE"
              : "CLOUD OFFLINE"}
          </StatusBadge>

          <StatusBadge
            type={
              mt5Connected
                ? "good"
                : "bad"
            }
          >
            {mt5Connected
              ? "MT5 CONNECTED"
              : "MT5 NOT CONNECTED"}
          </StatusBadge>

        </div>

        <button
          className="logout-button"
          onClick={
            handleLogout
          }
        >
          LOGOUT
        </button>

      </header>

      {/* HORIZONTAL NAVIGATION */}

      <nav className="top-nav">

        {NAV_ITEMS.map(
          ([icon, label]) => (
            <button
              key={label}
              className={
                activeNav ===
                label
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() =>
                setActiveNav(
                  label
                )
              }
            >
              <span>
                {icon}
              </span>

              <span>
                {label}
              </span>
            </button>
          )
        )}

      </nav>

      {/* MAIN */}

      <main className="main-content">

        {statusError && (
          <div className="warning-box">
            {statusError}
          </div>
        )}

        {loadingStatus && (
          <div className="info-box">
            Checking real cloud and MT5 status...
          </div>
        )}

        {renderContent()}

      </main>

    </div>
  );
}

/* =========================================================
   HOME
========================================================= */

function HomePanel({
  cloudOnline,
  mt5Connected,
  mt5Account,
  tradingEnabled,
  selectedSymbol,
  setSelectedSymbol,
  selectedBot,
  tradingMode,
  analysisMode,
  canTrade
}) {
  return (
    <section>

      <div className="page-heading">

        <div>
          <span className="eyebrow">
            ELISY254 CLOUD
          </span>

          <h1>
            Dashboard
          </h1>

          <p>
            Real account control
            without simulated
            MT5 data.
          </p>
        </div>

        <div className="live-state">

          <StatusBadge
            type={
              cloudOnline
                ? "good"
                : "bad"
            }
          >
            {cloudOnline
              ? "CLOUD ONLINE"
              : "CLOUD OFFLINE"}
          </StatusBadge>

          <StatusBadge
            type={
              mt5Connected
                ? "good"
                : "bad"
            }
          >
            {mt5Connected
              ? "MT5 CONNECTED"
              : "MT5 NOT CONNECTED"}
          </StatusBadge>

        </div>

      </div>

      <div className="dashboard-grid">

        <InfoCard
          title="BROKER"
          value={
            mt5Connected
              ? "CONNECTED ACCOUNT"
              : "NOT CONNECTED"
          }
          icon="🏦"
        />

        <InfoCard
          title="ACCOUNT"
          value={
            mt5Connected &&
            mt5Account?.login
              ? maskAccount(
                  mt5Account.login
                )
              : "—"
          }
          icon="👤"
        />

        <InfoCard
          title="BALANCE"
          value={
            mt5Connected &&
            mt5Account?.balance != null
              ? formatNumber(
                  mt5Account.balance
                )
              : "—"
          }
          icon="💰"
        />

        <InfoCard
          title="EQUITY"
          value={
            mt5Connected &&
            mt5Account?.equity != null
              ? formatNumber(
                  mt5Account.equity
                )
              : "—"
          }
          icon="📈"
        />

        <InfoCard
          title="FREE MARGIN"
          value={
            mt5Connected &&
            mt5Account?.freeMargin != null
              ? formatNumber(
                  mt5Account.freeMargin
                )
              : "—"
          }
          icon="🛡️"
        />

        <InfoCard
          title="CURRENCY"
          value={
            mt5Connected &&
            mt5Account?.currency
              ? mt5Account.currency
              : "—"
          }
          icon="💵"
        />

      </div>

      <div className="control-grid">

        <div className="control-card">

          <h2>
            ⚙️ Trading Configuration
          </h2>

          <label>
            Trading Mode
          </label>

          <div className="readonly-control">
            {tradingMode}
          </div>

          <label>
            Analysis Mode
          </label>

          <div className="readonly-control">
            {analysisMode}
          </div>

          <label>
            Selected Bot
          </label>

          <div className="readonly-control">
            {selectedBot}
          </div>

        </div>

        <div className="control-card">

          <h2>
            📊 Market
          </h2>

          <label>
            Symbol
          </label>

          <select
            value={
              selectedSymbol
            }
            onChange={(event) =>
              setSelectedSymbol(
                event.target.value
              )
            }
          >
            <option>
              XAUUSD
            </option>

            <option>
              EURUSD
            </option>

            <option>
              GBPUSD
            </option>

            <option>
              USDJPY
            </option>

            <option>
              BTCUSD
            </option>
          </select>

          <div className="market-state">
            🔵 Selected:
            {" "}
            {selectedSymbol}
          </div>

        </div>

      </div>

      <div className="connection-panel">

        <div className="brain-small">
          🧠
        </div>

        <div>

          <h2>
            MT5 CONNECTION
          </h2>

          {mt5Connected ? (
            <>
              <p className="success-text">
                🟢 Real MT5 account
                verified.
              </p>

              <p>
                Account information
                is being received
                from the real
                trading connection.
              </p>
            </>
          ) : (
            <>
              <p className="danger-text">
                🔴 MT5 NOT CONNECTED
              </p>

              <p>
                No simulated account
                is being displayed.
                Connect a real MT5
                account before
                trading.
              </p>
            </>
          )}

        </div>

      </div>

      <div className="trading-state">

        <strong>
          TRADING STATUS
        </strong>

        <span
          className={
            canTrade
              ? "trade-enabled"
              : "trade-disabled"
          }
        >
          {canTrade
            ? "🟢 REAL TRADING AVAILABLE"
            : "🔴 TRADING BLOCKED"}
        </span>

        {!mt5Connected && (
          <small>
            Real MT5 connection
            required.
          </small>
        )}

        {mt5Connected &&
          !tradingEnabled && (
            <small>
              MT5 is connected,
              but real trading
              is disabled by the
              server.
            </small>
          )}

      </div>

    </section>
  );
}

/* =========================================================
   MY BOT
========================================================= */

function MyBotPanel({
  selectedBot,
  setSelectedBot,
  mt5Connected
}) {
  return (
    <section>

      <PageTitle
        title="🤖 My Bot"
        text="Manage the bot assigned to your account."
      />

      <div className="bot-card">

        <div className="bot-icon">
          🤖
        </div>

        <div className="bot-information">

          <h2>
            {selectedBot}
          </h2>

          <p>
            Account-aware trading
            engine.
          </p>

          <div className="bot-status">
            {mt5Connected
              ? "🟢 MT5 READY"
              : "🔴 MT5 NOT CONNECTED"}
          </div>

        </div>

      </div>

      <div className="info-box">
        Bot execution requires
        a real verified MT5
        connection.
      </div>

    </section>
  );
}

/* =========================================================
   AUTO TRADE
========================================================= */

function AutoTradePanel({
  enabled,
  mt5Connected,
  tradingEnabled
}) {
  return (
    <section>

      <PageTitle
        title="⚡ Auto Trade"
        text="Automatic trading using the selected analysis and risk rules."
      />

      <div className="auto-trade-card">

        <div className="auto-icon">
          ⚡
        </div>

        <h2>
          AUTOMATIC TRADING
        </h2>

        <div
          className={
            enabled
              ? "big-state enabled"
              : "big-state disabled"
          }
        >
          {enabled
            ? "🟢 READY"
            : "🔴 BLOCKED"}
        </div>

        <div className="state-list">

          <StateRow
            label="Cloud"
            value="ONLINE"
            good
          />

          <StateRow
            label="MT5"
            value={
              mt5Connected
                ? "CONNECTED"
                : "NOT CONNECTED"
            }
            good={
              mt5Connected
            }
          />

          <StateRow
            label="Server Trading"
            value={
              tradingEnabled
                ? "ENABLED"
                : "DISABLED"
            }
            good={
              tradingEnabled
            }
          />

        </div>

        {!enabled && (
          <p className="danger-text">
            Automatic trading
            cannot start until
            all real connection
            requirements are
            satisfied.
          </p>
        )}

      </div>

    </section>
  );
}

/* =========================================================
   SIGNALS
========================================================= */

function SignalsPanel({
  mt5Connected,
  symbol
}) {
  return (
    <section>

      <PageTitle
        title="📡 Signals"
        text="Signals generated from real market/account connections."
      />

      <div className="signal-card">

        <div className="signal-symbol">
          {symbol}
        </div>

        <div className="signal-state">
          🔵 WAITING
        </div>

        <p>
          {mt5Connected
            ? "Real MT5 connection is available. Signal engine can operate when configured."
            : "MT5 is not connected. No fake signal is displayed."}
        </p>

      </div>

    </section>
  );
}

/* =========================================================
   MANUAL TRADE
========================================================= */

function ManualTradePanel({
  mt5Connected,
  canTrade,
  symbol
}) {
  const [
    volume,
    setVolume
  ] = useState("0.01");

  const [
    sending,
    setSending
  ] = useState(false);

  const [
    message,
    setMessage
  ] = useState("");

  async function submitTrade(
    side
  ) {
    setMessage("");

    if (!canTrade) {
      setMessage(
        "Real trading is blocked until MT5 and server trading are enabled."
      );
      return;
    }

    setSending(true);

    try {
      const result =
        await apiRequest(
          "/api/trade",
          {
            method: "POST",
            body: JSON.stringify({
              side,
              symbol,
              volume: Number(
                volume
              )
            })
          }
        );

      setMessage(
        result.message ||
          "Real broker order confirmed."
      );
    } catch (error) {
      setMessage(
        error.message
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section>

      <PageTitle
        title="✋ Manual Trade"
        text="Manual orders are sent to the real MT5 connection only."
      />

      <div className="manual-trade-card">

        <div className="real-only">
          REAL MT5 ONLY
        </div>

        <h2>
          {symbol}
        </h2>

        <label>
          Volume
        </label>

        <input
          type="number"
          min="0"
          step="0.01"
          value={volume}
          onChange={(event) =>
            setVolume(
              event.target.value
            )
          }
        />

        <div className="trade-buttons">

          <button
            className="buy-button"
            disabled={
              sending ||
              !canTrade
            }
            onClick={() =>
              submitTrade(
                "BUY"
              )
            }
          >
            {sending
              ? "..."
              : "BUY"}
          </button>

          <button
            className="sell-button"
            disabled={
              sending ||
              !canTrade
            }
            onClick={() =>
              submitTrade(
                "SELL"
              )
            }
          >
            {sending
              ? "..."
              : "SELL"}
          </button>

        </div>

        {!mt5Connected && (
          <div className="error-box">
            🔴 MT5 NOT CONNECTED.
            <br />
            Manual trading is
            blocked.
          </div>
        )}

        {message && (
          <div className="info-box">
            {message}
          </div>
        )}

      </div>

    </section>
  );
}

/* =========================================================
   ANALYSIS
========================================================= */

function AnalysisPanel({
  mode,
  setMode,
  symbol
}) {
  return (
    <section>

      <PageTitle
        title="📊 Analysis"
        text="Choose the real analysis source."
      />

      <div className="analysis-card">

        <h2>
          🔵 Analysis Mode
        </h2>

        <div className="mode-buttons">

          <button
            className={
              mode ===
              "ENGINE"
                ? "mode active"
                : "mode"
            }
            onClick={() =>
              setMode(
                "ENGINE"
              )
            }
          >
            ⚙️ ENGINE
          </button>

          <button
            className={
              mode ===
              "AI"
                ? "mode active"
                : "mode"
            }
            onClick={() =>
              setMode(
                "AI"
              )
            }
          >
            🧠 AI
          </button>

        </div>

        <div className="analysis-source">

          {mode ===
          "ENGINE" ? (
            <>
              <h3>
                ENGINE ANALYSIS
              </h3>

              <p>
                Built-in analysis.
                No AI API payment
                is required.
              </p>
            </>
          ) : (
            <>
              <h3>
                AI ANALYSIS
              </h3>

              <div className="ai-options">

                <button>
                  ChatGPT
                </button>

                <button>
                  Gemini
                </button>

                <button>
                  Cloud AI
                </button>

                <button>
                  DeepSeek
                </button>

              </div>

              <p>
                AI API credentials
                must remain on the
                backend.
              </p>
            </>
          )}

        </div>

        <div className="symbol-display">
          🔵 {symbol}
        </div>

      </div>

    </section>
  );
}

/* =========================================================
   AVAILABLE BOTS
========================================================= */

function AvailableBotsPanel({
  selectedBot,
  setSelectedBot
}) {
  const bots = [
    {
      name:
        "ELISY254 ENGINE",
      description:
        "Account-aware trading engine.",
      status:
        "PUBLISHED"
    }
  ];

  return (
    <section>

      <PageTitle
        title="🤖 Available Bots"
        text="Bots published by the ELISY254 administrator."
      />

      <div className="bot-list">

        {bots.map((bot) => (
          <div
            className="available-bot"
            key={bot.name}
          >

            <div>
              <h2>
                {bot.name}
              </h2>

              <p>
                {bot.description}
              </p>

              <span className="published">
                🟢 {bot.status}
              </span>
            </div>

            <button
              onClick={() =>
                setSelectedBot(
                  bot.name
                )
              }
            >
              {selectedBot ===
              bot.name
                ? "SELECTED"
                : "SELECT"}
            </button>

          </div>
        ))}

      </div>

    </section>
  );
}

/* =========================================================
   PORTFOLIO
========================================================= */

function PortfolioPanel({
  connected,
  account
}) {
  return (
    <section>

      <PageTitle
        title="💼 Portfolio"
        text="Real account information only."
      />

      {!connected ? (
        <div className="connection-panel">

          <div className="brain-small">
            🧠
          </div>

          <div>
            <h2>
              MT5 NOT CONNECTED
            </h2>

            <p>
              Portfolio data is
              unavailable until a
              real MT5 account is
              connected.
            </p>
          </div>

        </div>
      ) : (
        <div className="dashboard-grid">

          <InfoCard
            title="BALANCE"
            value={
              formatNumber(
                account?.balance
              )
            }
            icon="💰"
          />

          <InfoCard
            title="EQUITY"
            value={
              formatNumber(
                account?.equity
              )
            }
            icon="📈"
          />

          <InfoCard
            title="FREE MARGIN"
            value={
              formatNumber(
                account?.freeMargin
              )
            }
            icon="🛡️"
          />

          <InfoCard
            title="CURRENCY"
            value={
              account?.currency ||
              "—"
            }
            icon="💵"
          />

        </div>
      )}

    </section>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsPanel({
  tradingMode,
  setTradingMode,
  analysisMode,
  setAnalysisMode,
  riskEnabled,
  setRiskEnabled
}) {
  return (
    <section>

      <PageTitle
        title="⚙️ Settings"
        text="Configure how ELISY254 operates."
      />

      <div className="settings-grid">

        <div className="setting-card">

          <h2>
            Trading Mode
          </h2>

          <select
            value={
              tradingMode
            }
            onChange={(event) =>
              setTradingMode(
                event.target.value
              )
            }
          >
            <option>
              AUTO TRADE
            </option>

            <option>
              SIGNAL ONLY
            </option>

            <option>
              MANUAL TRADE
            </option>
          </select>

        </div>

        <div className="setting-card">

          <h2>
            Analysis
          </h2>

          <select
            value={
              analysisMode
            }
            onChange={(event) =>
              setAnalysisMode(
                event.target.value
              )
            }
          >
            <option>
              ENGINE
            </option>

            <option>
              AI
            </option>
          </select>

        </div>

        <div className="setting-card">

          <h2>
            Risk Protection
          </h2>

          <button
            className={
              riskEnabled
                ? "toggle on"
                : "toggle off"
            }
            onClick={() =>
              setRiskEnabled(
                !riskEnabled
              )
            }
          >
            {riskEnabled
              ? "🟢 ENABLED"
              : "🔴 DISABLED"}
          </button>

          <p>
            Server-side risk
            controls remain
            authoritative.
          </p>

        </div>

      </div>

      <div className="warning-box">
        ⚠️ Settings do not
        guarantee profit. Real
        trading remains subject
        to broker conditions,
        account balance, margin,
        risk rules and server
        protections.
      </div>

    </section>
  );
}

/* =========================================================
   SIMPLE PANEL
========================================================= */

function SimplePanel({
  title,
  text
}) {
  return (
    <section>

      <PageTitle
        title={title}
        text={text}
      />

      <div className="empty-panel">
        <div className="brain-small">
          🧠
        </div>

        <p>
          This section is ready
          for the real backend
          data source.
        </p>
      </div>

    </section>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function PageTitle({
  title,
  text
}) {
  return (
    <div className="page-heading">

      <div>

        <span className="eyebrow">
          ELISY254 CLOUD
        </span>

        <h1>
          {title}
        </h1>

        <p>
          {text}
        </p>

      </div>

    </div>
  );
}

function InfoCard({
  title,
  value,
  icon
}) {
  return (
    <div className="info-card">

      <div className="info-icon">
        {icon}
      </div>

      <div>
        <small>
          {title}
        </small>

        <strong>
          {value}
        </strong>
      </div>

    </div>
  );
}

function StateRow({
  label,
  value,
  good
}) {
  return (
    <div className="state-row">

      <span>
        {label}
      </span>

      <strong
        className={
          good
            ? "success-text"
            : "danger-text"
        }
      >
        {good
          ? "🟢 "
          : "🔴 "}
        {value}
      </strong>

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function maskAccount(
  value
) {
  const text =
    String(value);

  if (text.length <= 4) {
    return text;
  }

  return (
    "••••" +
    text.slice(-4)
  );
}

function formatNumber(
  value
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return "—";
  }

  return number.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [
    splash,
    setSplash
  ] = useState(true);

  const [
    authenticated,
    setAuthenticated
  ] = useState(
    Boolean(
      sessionStorage.getItem(
        "elisy_user_token"
      )
    )
  );

  useEffect(() => {
    const token =
      sessionStorage.getItem(
        "elisy_user_token"
      );

    setAuthenticated(
      Boolean(token)
    );
  }, []);

  if (splash) {
    return (
      <Splash
        onFinished={() =>
          setSplash(false)
        }
      />
    );
  }

  if (!authenticated) {
    return (
      <Landing
        onVerified={() =>
          setAuthenticated(
            true
          )
        }
      />
    );
  }

  return (
    <Dashboard
      onLogout={() => {
        sessionStorage.removeItem(
          "elisy_user_token"
        );

        setAuthenticated(
          false
        );
      }}
    />
  );
}

/* =========================================================
   START
========================================================= */

createRoot(
  document.getElementById(
    "root"
  )
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
