import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

/*
  ELISY254 CLOUD
  Frontend
  Vercel → Render backend

  Important:
  - No fake MT5 balances.
  - No fake broker connection.
  - Live trading remains controlled by backend TRADING_ENABLED.
  - Bot files/images currently use URLs because the backend does not
    yet have object-storage/multipart upload.
*/

const API_URL =
  (import.meta.env.VITE_API_URL || "https://elisy254-sharp-mvfi.onrender.com")
    .replace(/\/+$/, "");

const USER_TOKEN_KEY = "elisy254_user_token";
const ADMIN_TOKEN_KEY = "elisy254_admin_token";
const SELECTED_BOT_KEY = "elisy254_selected_bot";

const USER_NAV = [
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

const ADMIN_NAV = [
  ["🏠", "Dashboard"],
  ["🤖", "Bot Management"],
  ["👥", "Users"],
  ["💳", "MT5 Accounts"],
  ["📊", "Trading Activity"],
  ["🧠", "Analysis / AI"],
  ["🔑", "Access Keys"],
  ["🛡️", "Risk Controls"],
  ["💼", "Portfolio / Accounts"],
  ["📜", "Trade History"],
  ["📰", "News"],
  ["⚙️", "System Settings"],
  ["🔐", "Admin Security"],
];

function getUserToken() {
  return localStorage.getItem(USER_TOKEN_KEY);
}

function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

function saveUserToken(token) {
  if (token) localStorage.setItem(USER_TOKEN_KEY, token);
}

function saveAdminToken(token) {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

function clearUserToken() {
  localStorage.removeItem(USER_TOKEN_KEY);
}

function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function getStoredBot() {
  try {
    return JSON.parse(localStorage.getItem(SELECTED_BOT_KEY) || "null");
  } catch {
    return null;
  }
}

function saveSelectedBot(bot) {
  if (bot) {
    localStorage.setItem(SELECTED_BOT_KEY, JSON.stringify(bot));
  } else {
    localStorage.removeItem(SELECTED_BOT_KEY);
  }
}

async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    token,
    admin = false,
    headers = {},
  } = options;

  const finalHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const authToken = token || (admin ? getAdminToken() : getUserToken());

  if (authToken) {
    finalHeaders.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => ({}));
  } else {
    data = await response.text().catch(() => "");
  }

  if (!response.ok) {
    const message =
      typeof data === "object"
        ? data.message || data.error || `Request failed (${response.status})`
        : data || `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}

function firstArray(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function unwrapData(data) {
  if (data?.data && typeof data.data === "object") {
    return data.data;
  }

  return data;
}

function formatMoney(value, currency = "USD") {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(number);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

function statusClass(status) {
  const value = String(status || "").toLowerCase();

  if (
    value.includes("connected") ||
    value.includes("online") ||
    value.includes("published") ||
    value.includes("success") ||
    value === "true"
  ) {
    return "status-online";
  }

  if (
    value.includes("offline") ||
    value.includes("disabled") ||
    value.includes("failed") ||
    value.includes("error")
  ) {
    return "status-offline";
  }

  return "status-warning";
}

function StatusPill({ status, children }) {
  return (
    <span className={`pill ${statusClass(status)}`}>
      {children || status || "UNKNOWN"}
    </span>
  );
}

function Loading({ text = "Loading..." }) {
  return <div className="info-box">⏳ {text}</div>;
}

function ErrorBox({ message }) {
  if (!message) return null;

  return <div className="error-box">⚠️ {message}</div>;
}

function EmptyBox({ children = "No data available." }) {
  return <div className="info-box">ℹ️ {children}</div>;
}

/* =========================================================
   LANDING
========================================================= */

function LandingScreen({ onUserLogin, onAdminLogin }) {
  const [accessKey, setAccessKey] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 900);
    const timer2 = setTimeout(() => setStage(2), 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  async function handleLogin(e) {
    e.preventDefault();

    setError("");

    if (!accessKey.trim()) {
      setError(adminMode ? "Enter the admin email/password." : "Enter your access key.");
      return;
    }

    setBusy(true);

    try {
      if (adminMode) {
        const parts = accessKey.split("|");

        if (parts.length < 2) {
          throw new Error(
            "For admin login enter: ADMIN_EMAIL|ADMIN_PASSWORD"
          );
        }

        const result = await apiRequest("/api/admin/login", {
          method: "POST",
          body: {
            email: parts[0].trim(),
            password: parts.slice(1).join("|").trim(),
          },
        });

        const token = result?.token || result?.data?.token;

        if (!token) {
          throw new Error("Admin login succeeded but no token was returned.");
        }

        saveAdminToken(token);
        onAdminLogin();
      } else {
        const result = await apiRequest("/api/auth/key", {
          method: "POST",
          body: {
            accessKey: accessKey.trim(),
            access_key: accessKey.trim(),
            key: accessKey.trim(),
          },
        });

        const token = result?.token || result?.data?.token;

        if (!token) {
          throw new Error("Login succeeded but no user token was returned.");
        }

        saveUserToken(token);
        onUserLogin();
      }
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="landing-page">
      <div className="landing-card">
        {stage === 0 && (
          <>
            <div className="brain-logo">🧠</div>
            <h1>WELCOME TO ELISY254</h1>
            <p>GAME MINDED</p>
          </>
        )}

        {stage === 1 && (
          <>
            <div className="brain-logo">🧠</div>
            <h1>SHARP MINDED 😀 😎</h1>
            <p>ELISY254 CLOUD</p>
          </>
        )}

        {stage >= 2 && (
          <>
            <div className="brain-logo small">🧠</div>

            <h1>ELISY254 CLOUD</h1>

            <p className="landing-subtitle">
              Professional MT5 trading control platform
            </p>

            <div className="landing-status">
              <StatusPill status="online">🟢 CLOUD ONLINE</StatusPill>
              <StatusPill status="offline">🔴 MT5 OFFLINE</StatusPill>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <label>
                {adminMode ? "Admin Email | Password" : "Private Access Key"}
              </label>

              <input
                type={adminMode ? "text" : "password"}
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder={
                  adminMode
                    ? "admin@example.com|password"
                    : "Enter your private access key"
                }
              />

              <button className="primary-button" disabled={busy}>
                {busy ? "CONNECTING..." : adminMode ? "ADMIN LOGIN" : "ENTER CLOUD"}
              </button>
            </form>

            <ErrorBox message={error} />

            <button
              className="text-button"
              type="button"
              onClick={() => {
                setAdminMode(!adminMode);
                setAccessKey("");
                setError("");
              }}
            >
              {adminMode
                ? "← User Access"
                : "Admin Login"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   USER APP
========================================================= */

function UserApp({ onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [bots, setBots] = useState([]);
  const [botsLoading, setBotsLoading] = useState(false);

  const [trades, setTrades] = useState([]);
  const [tradesLoading, setTradesLoading] = useState(false);

  const [selectedBot, setSelectedBot] = useState(getStoredBot());

  async function loadUser() {
    try {
      setLoading(true);
      setError("");

      const [meResult, healthResult] = await Promise.all([
        apiRequest("/api/auth/me"),
        apiRequest("/api/health"),
      ]);

      setUser(unwrapData(meResult)?.user || unwrapData(meResult));
      setHealth(unwrapData(healthResult));
    } catch (err) {
      setError(err.message || "Unable to load account.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAccounts() {
    try {
      setAccountsLoading(true);

      const result = await apiRequest("/api/mt5/accounts");

      const list = firstArray(result, ["accounts", "mt5Accounts"]);
      setAccounts(list);
    } catch (err) {
      console.error("MT5 account loading error:", err);
    } finally {
      setAccountsLoading(false);
    }
  }

  async function loadBots() {
    try {
      setBotsLoading(true);

      const result = await apiRequest("/api/bots");

      const list = firstArray(result, ["bots"]);
      setBots(list);
    } catch (err) {
      console.error("Bot loading error:", err);
    } finally {
      setBotsLoading(false);
    }
  }

  async function loadTrades() {
    try {
      setTradesLoading(true);

      const result = await apiRequest("/api/trades");

      const list = firstArray(result, ["trades"]);
      setTrades(list);
    } catch (err) {
      console.error("Trade loading error:", err);
    } finally {
      setTradesLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
    loadAccounts();
    loadBots();
    loadTrades();
  }, []);

  useEffect(() => {
    if (!getUserToken()) {
      onLogout();
    }
  }, [onLogout]);

  const selectedAccount = accounts[0] || null;

  function chooseBot(bot) {
    setSelectedBot(bot);
    saveSelectedBot(bot);
  }

  function logout() {
    clearUserToken();
    onLogout();
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Loading text="Connecting to ELISY254 CLOUD..." />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="top-header">
        <div>
          <strong>🧠 ELISY254 CLOUD</strong>
          <small>
            {user?.email ||
              user?.username ||
              user?.name ||
              "Private User"}
          </small>
        </div>

        <div className="header-actions">
          <StatusPill status="online">🟢 CLOUD</StatusPill>
          <StatusPill
            status={
              health?.mt5ProviderConfigured
                ? "online"
                : "offline"
            }
          >
            {health?.mt5ProviderConfigured
              ? "🟢 MT5 PROVIDER"
              : "🔴 MT5 NOT CONFIGURED"}
          </StatusPill>

          <button className="small-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="horizontal-nav">
        {USER_NAV.map(([icon, label]) => (
          <button
            key={label}
            className={activePage === label ? "nav-active" : ""}
            onClick={() => setActivePage(label)}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <main className="page-content">
        {error && <ErrorBox message={error} />}

        {activePage === "Dashboard" && (
          <UserDashboard
            user={user}
            health={health}
            accounts={accounts}
            trades={trades}
            selectedBot={selectedBot}
            onRefresh={() => {
              loadAccounts();
              loadBots();
              loadTrades();
            }}
          />
        )}

        {activePage === "My Bot" && (
          <MyBotPanel
            selectedBot={selectedBot}
            bots={bots}
            loading={botsLoading}
            onChoose={chooseBot}
            onOpenAvailable={() => setActivePage("Available Bots")}
          />
        )}

        {activePage === "Auto Trade" && (
          <AutoTradePanel
            selectedBot={selectedBot}
            account={selectedAccount}
            health={health}
          />
        )}

        {activePage === "Signals" && (
          <SignalsPanel
            selectedBot={selectedBot}
            health={health}
          />
        )}

        {activePage === "Manual Trade" && (
          <ManualTradePanel
            account={selectedAccount}
            health={health}
            onTradeCreated={loadTrades}
          />
        )}

        {activePage === "Analysis" && (
          <AnalysisPanel
            selectedBot={selectedBot}
            account={selectedAccount}
          />
        )}

        {activePage === "Available Bots" && (
          <AvailableBotsPanel
            bots={bots}
            loading={botsLoading}
            selectedBot={selectedBot}
            onChoose={chooseBot}
          />
        )}

        {activePage === "News" && <NewsPanel />}

        {activePage === "Trade History" && (
          <TradeHistoryPanel
            trades={trades}
            loading={tradesLoading}
            onRefresh={loadTrades}
          />
        )}

        {activePage === "Portfolio" && (
          <PortfolioPanel
            accounts={accounts}
            loading={accountsLoading}
            onRefresh={loadAccounts}
          />
        )}

        {activePage === "Settings" && (
          <UserSettingsPanel
            user={user}
            accounts={accounts}
            loading={accountsLoading}
            onRefreshAccounts={loadAccounts}
            selectedBot={selectedBot}
          />
        )}
      </main>
    </div>
  );
}

/* =========================================================
   USER DASHBOARD
========================================================= */

function UserDashboard({
  user,
  health,
  accounts,
  trades,
  selectedBot,
  onRefresh,
}) {
  const account = accounts[0];

  const balance =
    account?.balance ??
    account?.accountInformation?.balance ??
    account?.info?.balance;

  const equity =
    account?.equity ??
    account?.accountInformation?.equity ??
    account?.info?.equity;

  const connectionStatus =
    account?.status ||
    account?.connectionStatus ||
    (health?.mt5ProviderConfigured ? "Provider configured" : "Not connected");

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>🏠 Dashboard</h1>
          <p>Welcome back to ELISY254 CLOUD.</p>
        </div>

        <button className="small-button" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>

      <div className="dashboard-grid">
        <StatCard
          title="Cloud"
          value="ONLINE"
          icon="🟢"
        />

        <StatCard
          title="MT5"
          value={connectionStatus}
          icon="📡"
        />

        <StatCard
          title="Balance"
          value={balance !== undefined ? formatMoney(balance) : "—"}
          icon="💰"
        />

        <StatCard
          title="Equity"
          value={equity !== undefined ? formatMoney(equity) : "—"}
          icon="📈"
        />

        <StatCard
          title="Trades"
          value={trades.length}
          icon="📜"
        />

        <StatCard
          title="Selected Bot"
          value={selectedBot?.name || "None"}
          icon="🤖"
        />
      </div>

      <div className="panel">
        <h2>Account</h2>

        <p>
          User:{" "}
          <strong>
            {user?.email || user?.username || user?.name || "Private User"}
          </strong>
        </p>

        <p>
          MT5 provider:{" "}
          <StatusPill
            status={health?.mt5ProviderConfigured ? "online" : "offline"}
          >
            {health?.mt5Provider || "Not configured"}
          </StatusPill>
        </p>

        <p>
          Live trading:{" "}
          <StatusPill
            status={health?.tradingEnabled ? "online" : "offline"}
          >
            {health?.tradingEnabled ? "ENABLED" : "DISABLED"}
          </StatusPill>
        </p>
      </div>

      <div className="warning-box">
        🛡️ ELISY254 does not display fake trading data. If MT5 is not connected,
        balance/equity/positions remain unavailable.
      </div>
    </section>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <small>{title}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   MY BOT
========================================================= */

function MyBotPanel({
  selectedBot,
  bots,
  loading,
  onChoose,
  onOpenAvailable,
}) {
  return (
    <section>
      <div className="page-title">
        <div>
          <h1>🤖 My Bot</h1>
          <p>Your currently selected trading bot.</p>
        </div>
      </div>

      {!selectedBot ? (
        <div className="panel">
          <h2>No bot selected</h2>
          <p>Choose a published bot from Available Bots.</p>

          <button
            className="primary-button"
            onClick={onOpenAvailable}
          >
            🤖 Browse Available Bots
          </button>
        </div>
      ) : (
        <div className="panel">
          {selectedBot.image_url && (
            <img
              src={selectedBot.image_url}
              alt={selectedBot.name || "Bot"}
              className="bot-image"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}

          <h2>{selectedBot.name}</h2>

          <StatusPill status={selectedBot.status}>
            {selectedBot.status || "PUBLISHED"}
          </StatusPill>

          <p>{selectedBot.description || "No description provided."}</p>

          <div className="settings-list">
            <div className="setting-row">
              <span>Version</span>
              <strong>{selectedBot.version || "1.0.0"}</strong>
            </div>

            <div className="setting-row">
              <span>Bot ID</span>
              <strong>{selectedBot.id || "—"}</strong>
            </div>
          </div>

          <button
            className="small-button"
            onClick={onOpenAvailable}
          >
            Change Bot
          </button>
        </div>
      )}

      {loading && <Loading text="Loading published bots..." />}

      {!loading && bots.length === 0 && (
        <EmptyBox>No published bots are available yet.</EmptyBox>
      )}
    </section>
  );
}

/* =========================================================
   AUTO TRADE
========================================================= */

function AutoTradePanel({ selectedBot, account, health }) {
  const canRun =
    Boolean(selectedBot) &&
    Boolean(account) &&
    Boolean(health?.tradingEnabled);

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>⚡ Auto Trade</h1>
          <p>Automatic trading controlled by the backend risk engine.</p>
        </div>
      </div>

      <div className="panel">
        <h2>Auto Trade Status</h2>

        <div className="settings-list">
          <div className="setting-row">
            <span>Selected bot</span>
            <strong>{selectedBot?.name || "None"}</strong>
          </div>

          <div className="setting-row">
            <span>MT5 account</span>
            <strong>{account?.login || account?.account_id || "None"}</strong>
          </div>

          <div className="setting-row">
            <span>Trading enabled</span>
            <StatusPill status={health?.tradingEnabled ? "online" : "offline"}>
              {health?.tradingEnabled ? "ENABLED" : "DISABLED"}
            </StatusPill>
          </div>
        </div>

        {!canRun && (
          <div className="warning-box">
            🛡️ Auto Trade is currently blocked because the required
            bot/account/backend trading conditions are not satisfied.
          </div>
        )}

        {canRun && (
          <div className="info-box">
            🟢 Backend reports trading is enabled. Risk validation is still
            performed server-side before an order is sent.
          </div>
        )}

        <button
          className="primary-button"
          disabled={!canRun}
          title={
            !canRun
              ? "Trading is not currently available."
              : "Start Auto Trade"
          }
        >
          {canRun ? "START AUTO TRADE" : "AUTO TRADE BLOCKED"}
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   SIGNALS
========================================================= */

function SignalsPanel({ selectedBot, health }) {
  return (
    <section>
      <div className="page-title">
        <div>
          <h1>📡 Signals</h1>
          <p>Analysis signals without automatically placing orders.</p>
        </div>
      </div>

      <div className="panel">
        <h2>Signal Mode</h2>

        <div className="settings-list">
          <div className="setting-row">
            <span>Bot</span>
            <strong>{selectedBot?.name || "No bot selected"}</strong>
          </div>

          <div className="setting-row">
            <span>Cloud</span>
            <StatusPill status="online">ONLINE</StatusPill>
          </div>

          <div className="setting-row">
            <span>MT5</span>
            <StatusPill
              status={health?.mt5ProviderConfigured ? "online" : "offline"}
            >
              {health?.mt5ProviderConfigured
                ? "PROVIDER CONFIGURED"
                : "NOT CONFIGURED"}
            </StatusPill>
          </div>
        </div>

        <div className="info-box">
          📡 Signal-only mode does not automatically place a trade.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MANUAL TRADE
========================================================= */

function ManualTradePanel({ account, health, onTradeCreated }) {
  const [symbol, setSymbol] = useState("EURUSD");
  const [side, setSide] = useState("BUY");
  const [volume, setVolume] = useState("0.01");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submitTrade(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!account?.id) {
      setError("Connect/select an MT5 account first.");
      return;
    }

    if (!health?.tradingEnabled) {
      setError("Backend trading is currently disabled.");
      return;
    }

    setBusy(true);

    try {
      const result = await apiRequest("/api/trade", {
        method: "POST",
        body: {
          accountId: account.id,
          account_id: account.id,
          symbol,
          side,
          action: side,
          volume: Number(volume),
          lot: Number(volume),
          stopLoss: stopLoss ? Number(stopLoss) : undefined,
          takeProfit: takeProfit ? Number(takeProfit) : undefined,
        },
      });

      setMessage(
        result?.message ||
          result?.status ||
          "Trade request completed. Check Trade History for the broker result."
      );

      onTradeCreated?.();
    } catch (err) {
      setError(err.message || "Trade request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>✋ Manual Trade</h1>
          <p>Manual order request with backend validation.</p>
        </div>
      </div>

      <div className="panel">
        <div className="warning-box">
          ⚠️ No trade is guaranteed. The backend can reject an order for
          account, margin, risk, broker, or configuration reasons.
        </div>

        <form className="trade-form" onSubmit={submitTrade}>
          <label>
            MT5 Account
            <input
              value={
                account
                  ? account.login ||
                    account.account_id ||
                    account.id ||
                    ""
                  : "No account connected"
              }
              readOnly
            />
          </label>

          <label>
            Symbol
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            />
          </label>

          <label>
            Direction
            <select
              value={side}
              onChange={(e) => setSide(e.target.value)}
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </label>

          <label>
            Volume / Lot
            <input
              type="number"
              min="0"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
            />
          </label>

          <label>
            Stop Loss
            <input
              type="number"
              step="any"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="Optional"
            />
          </label>

          <label>
            Take Profit
            <input
              type="number"
              step="any"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="Optional"
            />
          </label>

          <button
            className="primary-button"
            disabled={busy || !account || !health?.tradingEnabled}
          >
            {busy ? "SENDING..." : "SEND TRADE REQUEST"}
          </button>
        </form>

        <ErrorBox message={error} />

        {message && (
          <div className="success-box">✅ {message}</div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   ANALYSIS
========================================================= */

function AnalysisPanel({ selectedBot, account }) {
  const [mode, setMode] = useState("ENGINE");

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>📊 Analysis</h1>
          <p>Choose how market analysis should be handled.</p>
        </div>
      </div>

      <div className="panel">
        <h2>Analysis Mode</h2>

        <div className="analysis-buttons">
          {["ENGINE", "ChatGPT", "Gemini", "Cloud AI", "DeepSeek"].map(
            (item) => (
              <button
                key={item}
                className={mode === item ? "primary-button" : "small-button"}
                onClick={() => setMode(item)}
              >
                {item}
              </button>
            )
          )}
        </div>

        <div className="settings-list">
          <div className="setting-row">
            <span>Selected mode</span>
            <strong>{mode}</strong>
          </div>

          <div className="setting-row">
            <span>Bot</span>
            <strong>{selectedBot?.name || "None"}</strong>
          </div>

          <div className="setting-row">
            <span>Account</span>
            <strong>
              {account?.login || account?.account_id || "None"}
            </strong>
          </div>
        </div>

        {mode === "ENGINE" ? (
          <div className="info-box">
            🧠 ENGINE mode uses the built-in analysis layer and does not
            require an external AI API key.
          </div>
        ) : (
          <div className="warning-box">
            🔐 {mode} requires its API credentials to be configured on the
            backend. Never put AI secret keys inside Vercel frontend code.
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   AVAILABLE BOTS
========================================================= */

function AvailableBotsPanel({
  bots,
  loading,
  selectedBot,
  onChoose,
}) {
  return (
    <section>
      <div className="page-title">
        <div>
          <h1>🤖 Available Bots</h1>
          <p>Published bots supplied by the ELISY254 backend.</p>
        </div>
      </div>

      {loading && <Loading text="Loading published bots..." />}

      {!loading && bots.length === 0 && (
        <EmptyBox>
          No published bots are available. An administrator can publish a bot
          from Bot Management.
        </EmptyBox>
      )}

      <div className="bot-grid">
        {bots.map((bot) => {
          const selected = selectedBot?.id === bot.id;

          return (
            <div
              className={`panel bot-card ${
                selected ? "selected-card" : ""
              }`}
              key={bot.id || bot.name}
            >
              {bot.image_url && (
                <img
                  src={bot.image_url}
                  alt={bot.name || "Bot"}
                  className="bot-image"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}

              <h2>{bot.name}</h2>

              <StatusPill status={bot.status}>
                {bot.status || "PUBLISHED"}
              </StatusPill>

              <p>{bot.description || "No description."}</p>

              <p>
                Version: <strong>{bot.version || "1.0.0"}</strong>
              </p>

              <button
                className={
                  selected ? "primary-button" : "small-button"
                }
                onClick={() => onChoose(bot)}
              >
                {selected ? "✓ SELECTED" : "SELECT BOT"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================
   NEWS
========================================================= */

function NewsPanel() {
  return (
    <section>
      <div className="page-title">
        <div>
          <h1>📰 News</h1>
          <p>Market/news area reserved for verified sources.</p>
        </div>
      </div>

      <div className="panel">
        <h2>News Feed</h2>
        <div className="info-box">
          📰 News integration can be connected later. No fake market news is
          displayed here.
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   TRADE HISTORY
========================================================= */

function TradeHistoryPanel({ trades, loading, onRefresh }) {
  return (
    <section>
      <div className="page-title">
        <div>
          <h1>📜 Trade History</h1>
          <p>Orders recorded by the ELISY254 backend.</p>
        </div>

        <button className="small-button" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>

      {loading && <Loading text="Loading trade history..." />}

      {!loading && trades.length === 0 && (
        <EmptyBox>No trades recorded yet.</EmptyBox>
      )}

      {!loading && trades.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Symbol</th>
                <th>Side</th>
                <th>Volume</th>
                <th>Status</th>
                <th>Ticket</th>
              </tr>
            </thead>

            <tbody>
              {trades.map((trade, index) => (
                <tr key={trade.id || index}>
                  <td>{formatDate(trade.created_at || trade.createdAt)}</td>
                  <td>{trade.symbol || "—"}</td>
                  <td>{trade.side || trade.action || "—"}</td>
                  <td>{trade.volume ?? trade.lot ?? "—"}</td>
                  <td>
                    <StatusPill status={trade.status}>
                      {trade.status || "UNKNOWN"}
                    </StatusPill>
                  </td>
                  <td>{trade.ticket || trade.order_id || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   PORTFOLIO
========================================================= */

function PortfolioPanel({ accounts, loading, onRefresh }) {
  const [positions, setPositions] = useState([]);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadPositions(account) {
    if (!account?.id) return;

    try {
      setPositionsLoading(true);
      setError("");

      const result = await apiRequest(
        `/api/mt5/accounts/${account.id}/positions`
      );

      setPositions(firstArray(result, ["positions"]));
    } catch (err) {
      setError(err.message || "Unable to load positions.");
    } finally {
      setPositionsLoading(false);
    }
  }

  useEffect(() => {
    if (accounts[0]) {
      loadPositions(accounts[0]);
    }
  }, [accounts]);

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>💼 Portfolio</h1>
          <p>Real MT5 account information when connected.</p>
        </div>

        <button
          className="small-button"
          onClick={() => {
            onRefresh();
            if (accounts[0]) loadPositions(accounts[0]);
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {error && <ErrorBox message={error} />}

      {loading && <Loading text="Loading MT5 accounts..." />}

      {accounts.length === 0 && !loading && (
        <EmptyBox>
          No MT5 account is connected yet. Add one from Settings.
        </EmptyBox>
      )}

      {accounts.map((account) => (
        <div className="panel" key={account.id}>
          <h2>
            MT5 Account{" "}
            {account.login || account.account_id || account.id}
          </h2>

          <div className="settings-list">
            <div className="setting-row">
              <span>Status</span>
              <StatusPill status={account.status}>
                {account.status || "UNKNOWN"}
              </StatusPill>
            </div>

            <div className="setting-row">
              <span>Balance</span>
              <strong>
                {formatMoney(
                  account.balance ??
                    account.accountInformation?.balance
                )}
              </strong>
            </div>

            <div className="setting-row">
              <span>Equity</span>
              <strong>
                {formatMoney(
                  account.equity ??
                    account.accountInformation?.equity
                )}
              </strong>
            </div>

            <div className="setting-row">
              <span>Margin</span>
              <strong>
                {formatMoney(
                  account.margin ??
                    account.accountInformation?.margin
                )}
              </strong>
            </div>
          </div>
        </div>
      ))}

      <div className="panel">
        <h2>Open Positions</h2>

        {positionsLoading && <Loading text="Loading positions..." />}

        {!positionsLoading && positions.length === 0 && (
          <EmptyBox>No open positions returned by MT5.</EmptyBox>
        )}

        {!positionsLoading && positions.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th>Volume</th>
                  <th>Profit</th>
                </tr>
              </thead>

              <tbody>
                {positions.map((position, index) => (
                  <tr key={position.id || index}>
                    <td>{position.symbol || "—"}</td>
                    <td>{position.type || position.side || "—"}</td>
                    <td>{position.volume ?? "—"}</td>
                    <td>{position.profit ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   USER SETTINGS + MT5
========================================================= */

function UserSettingsPanel({
  user,
  accounts,
  loading,
  onRefreshAccounts,
  selectedBot,
}) {
  const [showConnect, setShowConnect] = useState(false);

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>⚙️ Settings</h1>
          <p>Account, MT5 connection and risk-control settings.</p>
        </div>
      </div>

      <div className="panel">
        <h2>Account</h2>

        <div className="settings-list">
          <div className="setting-row">
            <span>User</span>
            <strong>
              {user?.email || user?.username || user?.name || "Private User"}
            </strong>
          </div>

          <div className="setting-row">
            <span>Selected Bot</span>
            <strong>{selectedBot?.name || "None"}</strong>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="section-header">
          <div>
            <h2>📡 MT5 Accounts</h2>
            <p>Connect your trading account through the configured backend provider.</p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowConnect(!showConnect)}
          >
            {showConnect ? "Close" : "＋ Connect MT5"}
          </button>
        </div>

        {showConnect && (
          <MT5ConnectForm
            onConnected={() => {
              setShowConnect(false);
              onRefreshAccounts();
            }}
          />
        )}

        {loading && <Loading text="Loading MT5 accounts..." />}

        {!loading && accounts.length === 0 && (
          <EmptyBox>
            No MT5 accounts connected.
          </EmptyBox>
        )}

        {accounts.map((account) => (
          <MT5AccountCard
            key={account.id}
            account={account}
            onSync={onRefreshAccounts}
          />
        ))}
      </div>

      <div className="panel">
        <h2>🛡️ Risk Controls</h2>

        <div className="settings-list">
          <SettingRow label="Martingale" value="OFF" />
          <SettingRow label="Unlimited Recovery" value="OFF" />
          <SettingRow label="Maximum Daily Loss" value="ON" />
          <SettingRow label="Stop Loss" value="ON" />
          <SettingRow label="Take Profit" value="ON" />
          <SettingRow label="Trade-size Calculation" value="ON" />
          <SettingRow label="Margin Check" value="ON" />
          <SettingRow label="Maximum Positions" value="ON" />
        </div>

        <div className="warning-box">
          🛡️ These controls are intended to be enforced by the backend.
          Frontend switches must never be treated as the security layer.
        </div>
      </div>
    </section>
  );
}

function SettingRow({ label, value }) {
  return (
    <div className="setting-row">
      <span>{label}</span>
      <StatusPill status={value}>{value}</StatusPill>
    </div>
  );
}

function MT5ConnectForm({ onConnected }) {
  const [form, setForm] = useState({
    login: "",
    server: "",
    password: "",
    region: "",
    name: "",
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!form.login || !form.server || !form.password) {
      setError("Login, server and password are required.");
      return;
    }

    setBusy(true);

    try {
      const result = await apiRequest("/api/mt5/accounts", {
        method: "POST",
        body: {
          login: form.login,
          server: form.server,
          password: form.password,
          region: form.region || undefined,
          name: form.name || undefined,
        },
      });

      setMessage(
        result?.message ||
          "MT5 account connection request created."
      );

      setForm({
        login: "",
        server: "",
        password: "",
        region: "",
        name: "",
      });

      setTimeout(() => {
        onConnected?.();
      }, 700);
    } catch (err) {
      setError(err.message || "MT5 connection failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="connect-box">
      <div className="warning-box">
        🔐 Your MT5 password is sent to the backend provider during connection.
        The frontend does not store it in localStorage.
      </div>

      <form className="trade-form" onSubmit={submit}>
        <label>
          Account Name
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="My MT5"
          />
        </label>

        <label>
          MT5 Login
          <input
            value={form.login}
            onChange={(e) => update("login", e.target.value)}
            placeholder="12345678"
          />
        </label>

        <label>
          Broker Server
          <input
            value={form.server}
            onChange={(e) => update("server", e.target.value)}
            placeholder="Broker-Server"
          />
        </label>

        <label>
          MT5 Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </label>

        <label>
          Provider Region
          <input
            value={form.region}
            onChange={(e) => update("region", e.target.value)}
            placeholder="Optional"
          />
        </label>

        <button
          className="primary-button"
          disabled={busy}
        >
          {busy ? "CONNECTING..." : "CONNECT MT5"}
        </button>
      </form>

      <ErrorBox message={error} />

      {message && (
        <div className="success-box">✅ {message}</div>
      )}
    </div>
  );
}

function MT5AccountCard({ account, onSync }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sync() {
    setError("");
    setBusy(true);

    try {
      await apiRequest(`/api/mt5/accounts/${account.id}/sync`, {
        method: "POST",
      });

      onSync?.();
    } catch (err) {
      setError(err.message || "Account sync failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="account-card">
      <div>
        <h3>
          {account.name ||
            account.login ||
            account.account_id ||
            `MT5 ${account.id}`}
        </h3>

        <p>
          Login:{" "}
          <strong>
            {account.login || account.account_id || "—"}
          </strong>
        </p>

        <p>
          Server:{" "}
          <strong>{account.server || "—"}</strong>
        </p>

        <StatusPill status={account.status}>
          {account.status || "UNKNOWN"}
        </StatusPill>
      </div>

      <button
        className="small-button"
        onClick={sync}
        disabled={busy}
      >
        {busy ? "SYNCING..." : "SYNC"}
      </button>

      <ErrorBox message={error} />
    </div>
  );
}

/* =========================================================
   ADMIN APP
========================================================= */

function AdminApp({ onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [admin, setAdmin] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdmin();
  }, []);

  async function loadAdmin() {
    try {
      setLoading(true);
      setError("");

      const [me, dashboardData] = await Promise.all([
        apiRequest("/api/admin/me", { admin: true }),
        apiRequest("/api/admin/dashboard", { admin: true }),
      ]);

      setAdmin(unwrapData(me)?.admin || unwrapData(me));
      setDashboard(unwrapData(dashboardData));
    } catch (err) {
      setError(err.message || "Admin session expired.");

      clearAdminToken();
      setTimeout(() => onLogout(), 500);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearAdminToken();
    onLogout();
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Loading text="Loading admin panel..." />
      </div>
    );
  }

  return (
    <div className="app-shell admin-shell">
      <header className="top-header">
        <div>
          <strong>🧠 ELISY254 CLOUD — ADMIN</strong>
          <small>
            {admin?.email ||
              admin?.username ||
              "Administrator"}
          </small>
        </div>

        <div className="header-actions">
          <StatusPill status="online">🟢 ADMIN</StatusPill>

          <button className="small-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="horizontal-nav">
        {ADMIN_NAV.map(([icon, label]) => (
          <button
            key={label}
            className={activePage === label ? "nav-active" : ""}
            onClick={() => setActivePage(label)}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <main className="page-content">
        {error && <ErrorBox message={error} />}

        {activePage === "Dashboard" && (
          <AdminDashboard
            dashboard={dashboard}
            onRefresh={loadAdmin}
          />
        )}

        {activePage === "Bot Management" && (
          <AdminBotManagement />
        )}

        {activePage === "Users" && (
          <AdminUsers dashboard={dashboard} />
        )}

        {activePage === "MT5 Accounts" && (
          <AdminMT5Accounts />
        )}

        {activePage === "Trading Activity" && (
          <AdminTradingActivity />
        )}

        {activePage === "Analysis / AI" && (
          <AdminAnalysis />
        )}

        {activePage === "Access Keys" && (
          <AdminAccessKeys />
        )}

        {activePage === "Risk Controls" && (
          <AdminRiskControls />
        )}

        {activePage === "Portfolio / Accounts" && (
          <AdminPortfolio />
        )}

        {activePage === "Trade History" && (
          <AdminTradeHistory />
        )}

        {activePage === "News" && (
          <AdminNews />
        )}

        {activePage === "System Settings" && (
          <AdminSystemSettings dashboard={dashboard} />
        )}

        {activePage === "Admin Security" && (
          <AdminSecurity />
        )}
      </main>
    </div>
  );
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({ dashboard, onRefresh }) {
  const stats = dashboard?.stats || dashboard || {};

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>🏠 Admin Dashboard</h1>
          <p>ELISY254 CLOUD platform overview.</p>
        </div>

        <button className="small-button" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>

      <div className="dashboard-grid">
        <StatCard
          title="Users"
          value={
            stats.users ??
            stats.userCount ??
            stats.totalUsers ??
            "—"
          }
          icon="👥"
        />

        <StatCard
          title="MT5 Accounts"
          value={
            stats.mt5Accounts ??
            stats.accounts ??
            stats.accountCount ??
            "—"
          }
          icon="📡"
        />

        <StatCard
          title="Bots"
          value={
            stats.bots ??
            stats.botCount ??
            stats.totalBots ??
            "—"
          }
          icon="🤖"
        />

        <StatCard
          title="Trades"
          value={
            stats.trades ??
            stats.tradeCount ??
            stats.totalTrades ??
            "—"
          }
          icon="📜"
        />

        <StatCard
          title="Trading"
          value={
            stats.tradingEnabled === true
              ? "ENABLED"
              : "DISABLED"
          }
          icon="⚡"
        />

        <StatCard
          title="MT5 Provider"
          value={
            stats.mt5Provider ||
            stats.provider ||
            "metaapi"
          }
          icon="☁️"
        />
      </div>

      <div className="warning-box">
        🛡️ Admin dashboard displays backend state. It does not create fake
        users, balances, trades or MT5 connections.
      </div>
    </section>
  );
}

/* =========================================================
   ADMIN BOT MANAGEMENT
========================================================= */

function AdminBotManagement() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingBot, setEditingBot] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadBots() {
    try {
      setLoading(true);
      setError("");

      const result = await apiRequest("/api/admin/bots", {
        admin: true,
      });

      setBots(firstArray(result, ["bots"]));
    } catch (err) {
      setError(err.message || "Unable to load bots.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBots();
  }, []);

  async function deleteBot(id) {
    if (!window.confirm("Delete this bot?")) return;

    try {
      await apiRequest(`/api/admin/bots/${id}`, {
        method: "DELETE",
        admin: true,
      });

      await loadBots();
    } catch (err) {
      setError(err.message || "Unable to delete bot.");
    }
  }

  async function updateStatus(bot, status) {
    try {
      await apiRequest(`/api/admin/bots/${bot.id}`, {
        method: "PATCH",
        admin: true,
        body: {
          status,
        },
      });

      await loadBots();
    } catch (err) {
      setError(err.message || "Unable to update bot.");
    }
  }

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>🤖 Bot Management</h1>
          <p>Add, edit, publish, disable and delete platform bots.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setEditingBot(null);
            setShowForm(true);
          }}
        >
          ＋ ADD BOT
        </button>
      </div>

      <div className="info-box">
        📌 Bot images/files currently use URL fields. The current backend does
        not yet provide object-storage multipart upload, so this screen does
        not pretend that local file uploads are already implemented.
      </div>

      <ErrorBox message={error} />

      {showForm && (
        <AdminBotForm
          bot={editingBot}
          onCancel={() => {
            setShowForm(false);
            setEditingBot(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditingBot(null);
            loadBots();
          }}
        />
      )}

      {loading && <Loading text="Loading bots..." />}

      {!loading && bots.length === 0 && (
        <EmptyBox>
          No bots exist yet. Use ADD BOT to create the first one.
        </EmptyBox>
      )}

      <div className="bot-grid">
        {bots.map((bot) => (
          <div className="panel bot-card" key={bot.id}>
            {bot.image_url && (
              <img
                src={bot.image_url}
                alt={bot.name || "Bot"}
                className="bot-image"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}

            <h2>{bot.name}</h2>

            <StatusPill status={bot.status}>
              {bot.status || "DRAFT"}
            </StatusPill>

            <p>
              {bot.description || "No description."}
            </p>

            <p>
              Version: <strong>{bot.version || "1.0.0"}</strong>
            </p>

            <div className="button-row">
              <button
                className="small-button"
                onClick={() => {
                  setEditingBot(bot);
                  setShowForm(true);
                }}
              >
                ✏️ Edit
              </button>

              {String(bot.status).toUpperCase() !== "PUBLISHED" ? (
                <button
                  className="small-button"
                  onClick={() =>
                    updateStatus(bot, "PUBLISHED")
                  }
                >
                  🟢 Publish
                </button>
              ) : (
                <button
                  className="small-button"
                  onClick={() =>
                    updateStatus(bot, "DISABLED")
                  }
                >
                  🔴 Disable
                </button>
              )}

              <button
                className="danger-button"
                onClick={() => deleteBot(bot.id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminBotForm({ bot, onCancel, onSaved }) {
  const [form, setForm] = useState({
    name: bot?.name || "",
    description: bot?.description || "",
    image_url: bot?.image_url || "",
    file_url: bot?.file_url || "",
    version: bot?.version || "1.0.0",
    status: bot?.status || "DRAFT",
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(e) {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Bot name is required.");
      return;
    }

    setBusy(true);

    try {
      if (bot?.id) {
        await apiRequest(`/api/admin/bots/${bot.id}`, {
          method: "PATCH",
          admin: true,
          body: form,
        });
      } else {
        await apiRequest("/api/admin/bots", {
          method: "POST",
          admin: true,
          body: form,
        });
      }

      onSaved?.();
    } catch (err) {
      setError(err.message || "Unable to save bot.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <h2>{bot ? "✏️ Edit Bot" : "➕ Add Bot"}</h2>

      <form className="trade-form" onSubmit={submit}>
        <label>
          Bot Name
          <input
            value={form.name}
            onChange={(e) =>
              update("name", e.target.value)
            }
            placeholder="ELISY254 ENGINE"
          />
        </label>

        <label>
          Description
          <textarea
            value={form.description}
            onChange={(e) =>
              update("description", e.target.value)
            }
            rows="4"
            placeholder="Describe the bot..."
          />
        </label>

        <label>
          Bot Image URL
          <input
            value={form.image_url}
            onChange={(e) =>
              update("image_url", e.target.value)
            }
            placeholder="https://..."
          />
        </label>

        <label>
          Bot File URL
          <input
            value={form.file_url}
            onChange={(e) =>
              update("file_url", e.target.value)
            }
            placeholder="https://..."
          />
        </label>

        <label>
          Version
          <input
            value={form.version}
            onChange={(e) =>
              update("version", e.target.value)
            }
            placeholder="1.0.0"
          />
        </label>

        <label>
          Status
          <select
            value={form.status}
            onChange={(e) =>
              update("status", e.target.value)
            }
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="DISABLED">DISABLED</option>
          </select>
        </label>

        <div className="button-row">
          <button
            type="submit"
            className="primary-button"
            disabled={busy}
          >
            {busy
              ? "SAVING..."
              : bot
              ? "UPDATE BOT"
              : "SAVE BOT"}
          </button>

          <button
            type="button"
            className="small-button"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
        </div>
      </form>

      <ErrorBox message={error} />
    </div>
  );
}

/* =========================================================
   ADMIN USERS
========================================================= */

function AdminUsers({ dashboard }) {
  return (
    <AdminSection
      title="👥 Users"
      description="Platform user overview."
    >
      <div className="info-box">
        👥 User management is connected to the backend account system.
      </div>

      <StatCard
        title="Registered Users"
        value={
          dashboard?.users ??
          dashboard?.userCount ??
          dashboard?.stats?.users ??
          "—"
        }
        icon="👥"
      />
    </AdminSection>
  );
}

/* =========================================================
   ADMIN MT5 ACCOUNTS
========================================================= */

function AdminMT5Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const result = await apiRequest(
        "/api/admin/mt5-accounts",
        { admin: true }
      );

      setAccounts(
        firstArray(result, ["accounts", "mt5Accounts"])
      );
    } catch (err) {
      setError(err.message || "Unable to load MT5 accounts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>💳 MT5 Accounts</h1>
          <p>Admin view of connected trading accounts.</p>
        </div>

        <button className="small-button" onClick={load}>
          🔄 Refresh
        </button>
      </div>

      <ErrorBox message={error} />

      {loading && <Loading text="Loading MT5 accounts..." />}

      {!loading && accounts.length === 0 && (
        <EmptyBox>No MT5 accounts are registered.</EmptyBox>
      )}

      {!loading &&
        accounts.map((account) => (
          <div className="panel" key={account.id}>
            <h2>
              {account.login ||
                account.account_id ||
                account.id}
            </h2>

            <div className="settings-list">
              <div className="setting-row">
                <span>User</span>
                <strong>
                  {account.user_id ||
                    account.userId ||
                    "—"}
                </strong>
              </div>

              <div className="setting-row">
                <span>Server</span>
                <strong>{account.server || "—"}</strong>
              </div>

              <div className="setting-row">
                <span>Status</span>
                <StatusPill status={account.status}>
                  {account.status || "UNKNOWN"}
                </StatusPill>
              </div>

              <div className="setting-row">
                <span>Balance</span>
                <strong>
                  {formatMoney(account.balance)}
                </strong>
              </div>

              <div className="setting-row">
                <span>Equity</span>
                <strong>
                  {formatMoney(account.equity)}
                </strong>
              </div>
            </div>
          </div>
        ))}
    </section>
  );
}

/* =========================================================
   ADMIN TRADING ACTIVITY
========================================================= */

function AdminTradingActivity() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const result = await apiRequest(
        "/api/admin/trades",
        { admin: true }
      );

      setTrades(firstArray(result, ["trades"]));
    } catch (err) {
      setError(err.message || "Unable to load trading activity.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>📊 Trading Activity</h1>
          <p>Backend-recorded trading activity.</p>
        </div>

        <button className="small-button" onClick={load}>
          🔄 Refresh
        </button>
      </div>

      <ErrorBox message={error} />

      {loading && <Loading text="Loading trading activity..." />}

      {!loading && trades.length === 0 && (
        <EmptyBox>No trading activity recorded.</EmptyBox>
      )}

      {!loading && trades.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Symbol</th>
                <th>Side</th>
                <th>Volume</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {trades.map((trade, index) => (
                <tr key={trade.id || index}>
                  <td>
                    {formatDate(
                      trade.created_at ||
                        trade.createdAt
                    )}
                  </td>

                  <td>
                    {trade.user_id ||
                      trade.userId ||
                      "—"}
                  </td>

                  <td>{trade.symbol || "—"}</td>

                  <td>
                    {trade.side ||
                      trade.action ||
                      "—"}
                  </td>

                  <td>
                    {trade.volume ??
                      trade.lot ??
                      "—"}
                  </td>

                  <td>
                    <StatusPill status={trade.status}>
                      {trade.status || "UNKNOWN"}
                    </StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   ADMIN PLACEHOLDER / INFORMATION SECTIONS
========================================================= */

function AdminAnalysis() {
  return (
    <AdminSection
      title="🧠 Analysis / AI"
      description="Analysis provider configuration."
    >
      <div className="settings-list">
        <SettingRow label="ENGINE" value="READY" />
        <SettingRow label="ChatGPT" value="BACKEND KEY REQUIRED" />
        <SettingRow label="Gemini" value="BACKEND KEY REQUIRED" />
        <SettingRow label="Cloud AI" value="BACKEND KEY REQUIRED" />
        <SettingRow label="DeepSeek" value="BACKEND KEY REQUIRED" />
      </div>

      <div className="warning-box">
        🔐 AI secret keys must remain on Render/backend environment variables.
      </div>
    </AdminSection>
  );
}

function AdminAccessKeys() {
  return (
    <AdminSection
      title="🔑 Access Keys"
      description="Private user access-key management."
    >
      <div className="info-box">
        🔑 Access-key administration can be expanded with dedicated backend
        endpoints. The current frontend does not fake key creation.
      </div>
    </AdminSection>
  );
}

function AdminRiskControls() {
  return (
    <AdminSection
      title="🛡️ Risk Controls"
      description="Platform safety configuration."
    >
      <div className="settings-list">
        <SettingRow label="Maximum Daily Loss" value="ON" />
        <SettingRow label="Margin Check" value="ON" />
        <SettingRow label="Maximum Positions" value="ON" />
        <SettingRow label="Stop Loss" value="ON" />
        <SettingRow label="Take Profit" value="ON" />
        <SettingRow label="Martingale" value="OFF" />
        <SettingRow label="Unlimited Recovery" value="OFF" />
      </div>
    </AdminSection>
  );
}

function AdminPortfolio() {
  return (
    <AdminSection
      title="💼 Portfolio / Accounts"
      description="Platform portfolio overview."
    >
      <div className="info-box">
        💼 Real account balances and positions are displayed when MT5
        provider data is available.
      </div>
    </AdminSection>
  );
}

function AdminTradeHistory() {
  return (
    <AdminSection
      title="📜 Trade History"
      description="Historical backend trade records."
    >
      <AdminTradingActivity />
    </AdminSection>
  );
}

function AdminNews() {
  return (
    <AdminSection
      title="📰 News"
      description="Verified market news management."
    >
      <div className="info-box">
        📰 News publishing endpoints are not enabled in the current backend.
        No fake news is displayed.
      </div>
    </AdminSection>
  );
}

function AdminSystemSettings({ dashboard }) {
  const stats = dashboard?.stats || dashboard || {};

  return (
    <AdminSection
      title="⚙️ System Settings"
      description="Current backend system state."
    >
      <div className="settings-list">
        <div className="setting-row">
          <span>Trading Enabled</span>
          <StatusPill
            status={stats.tradingEnabled ? "online" : "offline"}
          >
            {stats.tradingEnabled ? "ENABLED" : "DISABLED"}
          </StatusPill>
        </div>

        <div className="setting-row">
          <span>MT5 Provider</span>
          <strong>
            {stats.mt5Provider || "metaapi"}
          </strong>
        </div>

        <div className="setting-row">
          <span>Environment</span>
          <strong>Backend controlled</strong>
        </div>
      </div>

      <div className="warning-box">
        ⚠️ The current server does not expose a persistent `/api/admin/settings`
        endpoint, so this screen intentionally does not pretend editable
        settings are being saved.
      </div>
    </AdminSection>
  );
}

function AdminSecurity() {
  return (
    <AdminSection
      title="🔐 Admin Security"
      description="Security information."
    >
      <div className="settings-list">
        <SettingRow label="Admin JWT" value="BACKEND" />
        <SettingRow label="Admin Password" value="BACKEND ENV" />
        <SettingRow label="Frontend Admin Secret" value="NOT STORED" />
      </div>

      <div className="warning-box">
        🔐 Never put ADMIN_PASSWORD, JWT secrets, MetaApi tokens, broker
        passwords or AI API keys in Vercel frontend variables.
      </div>
    </AdminSection>
  );
}

function AdminSection({ title, description, children }) {
  return (
    <section>
      <div className="page-title">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>

      <div className="panel">{children}</div>
    </section>
  );
}

/* =========================================================
   APP ROUTER
========================================================= */

function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [userLoggedIn, setUserLoggedIn] = useState(
    Boolean(getUserToken())
  );
  const [adminLoggedIn, setAdminLoggedIn] = useState(
    Boolean(getAdminToken())
  );

  useEffect(() => {
    function handlePopState() {
      setRoute(window.location.pathname);
    }

    window.addEventListener("popstate", handlePopState);

    return () =>
      window.removeEventListener(
        "popstate",
        handlePopState
      );
  }, []);

  const isAdminRoute = route.startsWith("/admin");

  if (isAdminRoute) {
    if (!adminLoggedIn) {
      return (
        <LandingScreen
          onUserLogin={() => {
            setUserLoggedIn(true);
            setRoute("/");
            window.history.pushState({}, "", "/");
          }}
          onAdminLogin={() => {
            setAdminLoggedIn(true);
          }}
        />
      );
    }

    return (
      <AdminApp
        onLogout={() => {
          setAdminLoggedIn(false);
          setRoute("/");
          window.history.pushState({}, "", "/");
        }}
      />
    );
  }

  if (!userLoggedIn) {
    return (
      <LandingScreen
        onUserLogin={() => {
          setUserLoggedIn(true);
        }}
        onAdminLogin={() => {
          setAdminLoggedIn(true);
          setRoute("/admin");
          window.history.pushState({}, "", "/admin");
        }}
      />
    );
  }

  return (
    <UserApp
      onLogout={() => {
        setUserLoggedIn(false);
      }}
    />
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
