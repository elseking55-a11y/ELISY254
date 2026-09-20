import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const bots = [
  {
    id: "elisy-engine",
    name: "ELISY254 ENGINE",
    description: "Built-in account-aware trading engine",
    markets: "XAUUSD / Forex",
    analysis: "ENGINE",
    status: "Available"
  }
];

function App() {
  const [page, setPage] = useState("home");
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);

  const [analysisMode, setAnalysisMode] = useState("ENGINE");
  const [tradeMode, setTradeMode] = useState("AUTO");

  const [balance, setBalance] = useState("10.00");
  const [symbol, setSymbol] = useState("XAUUSD");

  const [risk, setRisk] = useState("0.5");
  const [maxTrades, setMaxTrades] = useState("1");
  const [dailyLoss, setDailyLoss] = useState("2");

  const [botRunning, setBotRunning] = useState(false);

  const [aiProvider, setAiProvider] = useState("ChatGPT");
  const [aiConnected, setAiConnected] = useState(false);

  function enterPlatform() {
    setLoggedIn(true);
    setPage("dashboard");
  }

  function selectBot(bot) {
    setSelectedBot(bot);
    setPage("bot");
  }

  function startBot() {
    if (!selectedBot) {
      setPage("bots");
      return;
    }

    setBotRunning(true);
  }

  function stopBot() {
    setBotRunning(false);
  }

  function connectAI() {
    setAiConnected(true);
  }

  if (!loggedIn) {
    return (
      <div className="landing">
        <div className="landingGlow glowOne"></div>
        <div className="landingGlow glowTwo"></div>

        <nav className="topbar">
          <div className="brand">
            <span className="brandDot"></span>
            ELISY254
          </div>

          <button
            className="navButton"
            onClick={enterPlatform}
          >
            LOGIN
          </button>
        </nav>

        <main className="hero">
          <div className="heroBadge">
            <span>●</span> CLOUD TRADING PLATFORM
          </div>

          <h1>
            WELCOME TO
            <br />
            <strong>ELISY254</strong>
          </h1>

          <p className="tagline">
            SHARP MINDED 🧠
          </p>

          <p className="heroText">
            A modern cloud control platform for your
            trading bots, analysis, signals and account
            management.
          </p>

          <div className="heroActions">
            <button
              className="primaryButton"
              onClick={enterPlatform}
            >
              GET STARTED
            </button>

            <button
              className="secondaryButton"
              onClick={() => {
                setLoggedIn(true);
                setPage("bots");
              }}
            >
              VIEW BOTS
            </button>
          </div>

          <div className="heroStats">
            <div>
              <strong>ENGINE</strong>
              <span>Built-in analysis</span>
            </div>

            <div>
              <strong>AI READY</strong>
              <span>4 AI providers</span>
            </div>

            <div>
              <strong>RISK</strong>
              <span>Account aware</span>
            </div>
          </div>
        </main>

        <footer className="landingFooter">
          ELISY254 CLOUD © 2026
        </footer>
      </div>
    );
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="sideBrand">
          <span className="brandDot"></span>
          <div>
            <strong>ELISY254</strong>
            <small>SHARP MINDED</small>
          </div>
        </div>

        <div className="mobileClose">
          MENU
        </div>

        <nav className="sideNav">
          <NavItem
            icon="🏠"
            label="Dashboard"
            active={page === "dashboard"}
            onClick={() => setPage("dashboard")}
          />

          <NavItem
            icon="🤖"
            label="My Bot"
            active={page === "bot"}
            onClick={() => setPage("bot")}
          />

          <NavItem
            icon="⚡"
            label="Auto Trade"
            active={page === "auto"}
            onClick={() => setPage("auto")}
          />

          <NavItem
            icon="📡"
            label="Signals"
            active={page === "signals"}
            onClick={() => setPage("signals")}
          />

          <NavItem
            icon="✋"
            label="Manual Trade"
            active={page === "manual"}
            onClick={() => setPage("manual")}
          />

          <NavItem
            icon="📊"
            label="Analysis"
            active={page === "analysis"}
            onClick={() => setPage("analysis")}
          />

          <NavItem
            icon="🤖"
            label="Available Bots"
            active={page === "bots"}
            onClick={() => setPage("bots")}
          />

          <NavItem
            icon="📰"
            label="News"
            active={page === "news"}
            onClick={() => setPage("news")}
          />

          <NavItem
            icon="📜"
            label="Trade History"
            active={page === "history"}
            onClick={() => setPage("history")}
          />

          <NavItem
            icon="⚙️"
            label="Settings"
            active={page === "settings"}
            onClick={() => setPage("settings")}
          />
        </nav>

        <button
          className="logoutButton"
          onClick={() => {
            setLoggedIn(false);
            setBotRunning(false);
            setPage("home");
          }}
        >
          Log out
        </button>
      </aside>

      <main className="mainContent">
        <header className="dashboardHeader">
          <div>
            <div className="headerKicker">
              ELISY254 CLOUD
            </div>

            <h2>
              {pageTitle(page)}
            </h2>
          </div>

          <div className="connection">
            <span
              className={
                botRunning
                  ? "statusDot online"
                  : "statusDot"
              }
            ></span>

            {botRunning
              ? "BOT RUNNING"
              : "MT5/API OFFLINE"}
          </div>
        </header>

        {page === "dashboard" && (
          <Dashboard
            balance={balance}
            symbol={symbol}
            setSymbol={setSymbol}
            selectedBot={selectedBot}
            botRunning={botRunning}
            startBot={startBot}
            stopBot={stopBot}
            analysisMode={analysisMode}
            tradeMode={tradeMode}
            setTradeMode={setTradeMode}
            setAnalysisMode={setAnalysisMode}
            setPage={setPage}
          />
        )}

        {page === "bots" && (
          <Bots
            bots={bots}
            selectBot={selectBot}
            selectedBot={selectedBot}
          />
        )}

        {page === "bot" && (
          <BotPage
            selectedBot={selectedBot}
            botRunning={botRunning}
            startBot={startBot}
            stopBot={stopBot}
            balance={balance}
            symbol={symbol}
            setSymbol={setSymbol}
            risk={risk}
            setRisk={setRisk}
            maxTrades={maxTrades}
            setMaxTrades={setMaxTrades}
            dailyLoss={dailyLoss}
            setDailyLoss={setDailyLoss}
          />
        )}

        {page === "auto" && (
          <AutoTrade
            botRunning={botRunning}
            startBot={startBot}
            stopBot={stopBot}
            balance={balance}
            risk={risk}
            maxTrades={maxTrades}
          />
        )}

        {page === "signals" && (
          <Signals symbol={symbol} />
        )}

        {page === "manual" && (
          <ManualTrade symbol={symbol} />
        )}

        {page === "analysis" && (
          <Analysis
            analysisMode={analysisMode}
            setAnalysisMode={setAnalysisMode}
            aiProvider={aiProvider}
            setAiProvider={setAiProvider}
            aiConnected={aiConnected}
            connectAI={connectAI}
          />
        )}

        {page === "news" && <News />}

        {page === "history" && (
          <History />
        )}

        {page === "settings" && (
          <Settings
            balance={balance}
            setBalance={setBalance}
            symbol={symbol}
            setSymbol={setSymbol}
            risk={risk}
            setRisk={setRisk}
            maxTrades={maxTrades}
            setMaxTrades={setMaxTrades}
            dailyLoss={dailyLoss}
            setDailyLoss={setDailyLoss}
            analysisMode={analysisMode}
            setAnalysisMode={setAnalysisMode}
            tradeMode={tradeMode}
            setTradeMode={setTradeMode}
          />
        )}
      </main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick
}) {
  return (
    <button
      className={`navItem ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

function Dashboard({
  balance,
  symbol,
  setSymbol,
  selectedBot,
  botRunning,
  startBot,
  stopBot,
  analysisMode,
  tradeMode,
  setTradeMode,
  setAnalysisMode,
  setPage
}) {
  return (
    <div className="page">
      <div className="accountGrid">
        <Card
          title="Balance"
          value={`$${balance}`}
          sub="Account balance"
        />

        <Card
          title="Equity"
          value={`$${balance}`}
          sub="Current equity"
        />

        <Card
          title="Broker"
          value="Not connected"
          sub="Connect MT5/API"
        />

        <Card
          title="Open Trades"
          value="0"
          sub="0 active positions"
        />
      </div>

      <div className="dashboardGrid">
        <section className="panel botPanel">
          <PanelTitle
            title="ELISY254 ENGINE"
            subtitle={
              selectedBot
                ? selectedBot.description
                : "Built-in trading engine"
            }
          />

          <div className="botStatus">
            <span
              className={
                botRunning
                  ? "bigStatus running"
                  : "bigStatus"
              }
            >
              {botRunning
                ? "● RUNNING"
                : "● STOPPED"}
            </span>

            <span className="badge">
              {analysisMode}
            </span>
          </div>

          <div className="controlRow">
            <div>
              <label>Symbol</label>
              <select
                value={symbol}
                onChange={(e) =>
                  setSymbol(e.target.value)
                }
              >
                <option>XAUUSD</option>
                <option>EURUSD</option>
                <option>GBPUSD</option>
                <option>USDJPY</option>
              </select>
            </div>

            <div>
              <label>Trading mode</label>
              <select
                value={tradeMode}
                onChange={(e) =>
                  setTradeMode(e.target.value)
                }
              >
                <option value="AUTO">
                  AUTO TRADE
                </option>

                <option value="SIGNAL">
                  SIGNAL ONLY
                </option>

                <option value="MANUAL">
                  MANUAL
                </option>
              </select>
            </div>
          </div>

          <div className="modeButtons">
            <button
              className={
                analysisMode === "ENGINE"
                  ? "modeButton selected"
                  : "modeButton"
              }
              onClick={() =>
                setAnalysisMode("ENGINE")
              }
            >
              ⚙️ ENGINE
            </button>

            <button
              className={
                analysisMode === "AI"
                  ? "modeButton selected"
                  : "modeButton"
              }
              onClick={() =>
                setAnalysisMode("AI")
              }
            >
              🧠 AI
            </button>
          </div>

          <button
            className={
              botRunning
                ? "stopButton"
                : "startButton"
            }
            onClick={
              botRunning
                ? stopBot
                : startBot
            }
          >
            {botRunning
              ? "■ STOP BOT"
              : "▶ START BOT"}
          </button>
        </section>

        <section className="panel">
          <PanelTitle
            title="Risk Control"
            subtitle="Account-aware protection"
          />

          <RiskRow
            label="Risk per trade"
            value="0.5%"
          />

          <RiskRow
            label="Maximum daily loss"
            value="2%"
          />

          <RiskRow
            label="Maximum open trades"
            value="1"
          />

          <RiskRow
            label="Martingale"
            value="OFF"
          />

          <RiskRow
            label="Loss recovery"
            value="OFF"
          />

          <div className="warningBox">
            Trades should be blocked when the
            broker's minimum volume exceeds the
            configured account risk.
          </div>
        </section>
      </div>

      <section className="panel">
        <PanelTitle
          title="Quick Access"
          subtitle="Manage your trading platform"
        />

        <div className="quickGrid">
          <QuickButton
            icon="🤖"
            title="Available Bots"
            onClick={() => setPage("bots")}
          />

          <QuickButton
            icon="📡"
            title="Signals"
            onClick={() => setPage("signals")}
          />

          <QuickButton
            icon="📊"
            title="Analysis"
            onClick={() => setPage("analysis")}
          />

          <QuickButton
            icon="⚙️"
            title="Settings"
            onClick={() => setPage("settings")}
          />
        </div>
      </section>
    </div>
  );
}

function Bots({
  bots,
  selectBot,
  selectedBot
}) {
  return (
    <div className="page">
      <section className="panel">
        <PanelTitle
          title="Available Bots"
          subtitle="Bots published by ELISY254"
        />

        <div className="botCards">
          {bots.map((bot) => (
            <div
              className="availableBot"
              key={bot.id}
            >
              <div className="botIcon">
                🤖
              </div>

              <div className="botInfo">
                <h3>{bot.name}</h3>

                <p>
                  {bot.description}
                </p>

                <div className="tagList">
                  <span>{bot.analysis}</span>
                  <span>{bot.markets}</span>
                  <span className="greenTag">
                    {bot.status}
                  </span>
                </div>
              </div>

              <button
                className="primarySmall"
                onClick={() =>
                  selectBot(bot)
                }
              >
                {selectedBot?.id === bot.id
                  ? "SELECTED"
                  : "SELECT"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function BotPage({
  selectedBot,
  botRunning,
  startBot,
  stopBot,
  balance,
  symbol,
  setSymbol,
  risk,
  setRisk,
  maxTrades,
  setMaxTrades,
  dailyLoss,
  setDailyLoss
}) {
  if (!selectedBot) {
    return (
      <EmptyState
        title="No bot selected"
        text="Choose ELISY254 ENGINE from Available Bots."
      />
    );
  }

  return (
    <div className="page">
      <section className="panel">
        <PanelTitle
          title={selectedBot.name}
          subtitle={selectedBot.description}
        />

        <div className="botHeader">
          <div className="largeBotIcon">
            🤖
          </div>

          <div>
            <div className="onlineLabel">
              ● AVAILABLE
            </div>

            <p>
              Built-in account-aware engine.
            </p>
          </div>
        </div>

        <div className="settingsGrid">
          <SettingInput
            label="Account balance"
            value={balance}
            disabled
          />

          <div>
            <label>Symbol</label>

            <select
              value={symbol}
              onChange={(e) =>
                setSymbol(e.target.value)
              }
            >
              <option>XAUUSD</option>
              <option>EURUSD</option>
              <option>GBPUSD</option>
              <option>USDJPY</option>
            </select>
          </div>

          <SettingInput
            label="Risk per trade %"
            value={risk}
            onChange={(e) =>
              setRisk(e.target.value)
            }
          />

          <SettingInput
            label="Maximum open trades"
            value={maxTrades}
            onChange={(e) =>
              setMaxTrades(e.target.value)
            }
          />

          <SettingInput
            label="Maximum daily loss %"
            value={dailyLoss}
            onChange={(e) =>
              setDailyLoss(e.target.value)
            }
          />

          <SettingInput
            label="Martingale"
            value="OFF"
            disabled
          />
        </div>

        <button
          className={
            botRunning
              ? "stopButton"
              : "startButton"
          }
          onClick={
            botRunning
              ? stopBot
              : startBot
          }
        >
          {botRunning
            ? "■ STOP ELISY254"
            : "▶ START ELISY254"}
        </button>
      </section>
    </div>
  );
}

function AutoTrade({
  botRunning,
  startBot,
  stopBot,
  balance,
  risk,
  maxTrades
}) {
  return (
    <div className="page">
      <section className="panel">
        <PanelTitle
          title="Auto Trade"
          subtitle="Automatic trading control"
        />

        <div className="autoStatus">
          <span
            className={
              botRunning
                ? "bigStatus running"
                : "bigStatus"
            }
          >
            {botRunning
              ? "● AUTO TRADE RUNNING"
              : "● AUTO TRADE STOPPED"}
          </span>
        </div>

        <div className="statsRow">
          <Stat label="Balance" value={`$${balance}`} />
          <Stat label="Risk" value={`${risk}%`} />
          <Stat label="Max trades" value={maxTrades} />
        </div>

        <div className="engineFlow">
          <span>MARKET</span>
          <b>→</b>
          <span>ENGINE</span>
          <b>→</b>
          <span>RISK CHECK</span>
          <b>→</b>
          <span>MT5/API</span>
        </div>

        <button
          className={
            botRunning
              ? "stopButton"
              : "startButton"
          }
          onClick={
            botRunning
              ? stopBot
              : startBot
          }
        >
          {botRunning
            ? "■ STOP AUTO TRADE"
            : "▶ START AUTO TRADE"}
        </button>
      </section>
    </div>
  );
}

function Signals({ symbol }) {
  return (
    <div className="page">
      <section className="panel">
        <PanelTitle
          title="Signals"
          subtitle="Engine signals"
        />

        <div className="signalCard">
          <div>
            <span className="signalSymbol">
              {symbol}
            </span>

            <h3>WAITING FOR VALID SETUP</h3>

            <p>
              No real trading signal is generated
              by this frontend demo.
            </p>
          </div>

          <span className="badge">
            ENGINE
          </span>
        </div>
      </section>
    </div>
  );
}

function ManualTrade({ symbol }) {
  return (
    <div className="page">
      <section className="panel">
        <PanelTitle
          title="Manual Trade"
          subtitle={`${symbol} order controls`}
        />

        <div className="manualGrid">
          <button className="buyButton">
            🟢 BUY
          </button>

          <button className="sellButton">
            🔴 SELL
          </button>
        </div>

        <div className="warningBox">
          Real order placement will only be enabled
          after the secure broker/API connection is
          implemented.
        </div>
      </section>
    </div>
  );
}

function Analysis({
  analysisMode,
  setAnalysisMode,
  aiProvider,
  setAiProvider,
  aiConnected,
  connectAI
}) {
  return (
    <div className="page">
      <section className="panel">
        <PanelTitle
          title="Analysis"
          subtitle="Choose your analysis engine"
        />

        <div className="modeButtons large">
          <button
            className={
              analysisMode === "ENGINE"
                ? "modeButton selected"
                : "modeButton"
            }
            onClick={() =>
              setAnalysisMode("ENGINE")
            }
          >
            ⚙️ ENGINE
            <small>
              Built-in analysis
            </small>
          </button>

          <button
            className={
              analysisMode === "AI"
                ? "modeButton selected"
                : "modeButton"
            }
            onClick={() =>
              setAnalysisMode("AI")
            }
          >
            🧠 AI
            <small>
              API required
            </small>
          </button>
        </div>

        {analysisMode === "ENGINE" && (
          <div className="successBox">
            ⚙️ ENGINE MODE ACTIVE
            <br />
            No AI API is required.
          </div>
        )}

        {analysisMode === "AI" && (
          <div className="aiBox">
            <h3>🧠 AI ACCESS</h3>

            <p>
              AI providers require their own secure
              backend API configuration.
            </p>

            <label>Provider</label>

            <select
              value={aiProvider}
              onChange={(e) =>
                setAiProvider(e.target.value)
              }
            >
              <option>ChatGPT</option>
              <option>Gemini</option>
              <option>Cloud AI</option>
              <option>DeepSeek</option>
            </select>

            <div className="apiStatus">
              Status:{" "}
              {aiConnected
                ? "🟢 CONNECTED"
                : "🔴 NOT CONNECTED"}
            </div>

            <button
              className="primarySmall"
              onClick={connectAI}
            >
              CONNECT AI
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function News() {
  return (
    <div className="page">
      <section className="panel">
        <PanelTitle
          title="Market News"
          subtitle="News feed will connect to the backend"
        />

        <div className="emptyContent">
          📰 Market news
          <p>
            News integration will be connected
            through the backend.
          </p>
        </div>
      </section>
    </div>
  );
}

function History() {
  return (
    <div className="page">
      <section className="panel">
        <PanelTitle
          title="Trade History"
          subtitle="Your trading activity"
        />

        <div className="emptyContent">
          📜 No trades yet.
          <p>
            Real trade history will come from the
            connected trading API.
          </p>
        </div>
      </section>
    </div>
  );
}

function Settings({
  balance,
  setBalance,
  symbol,
  setSymbol,
  risk,
  setRisk,
  maxTrades,
  setMaxTrades,
  dailyLoss,
  setDailyLoss,
  analysisMode,
  setAnalysisMode,
  tradeMode,
  setTradeMode
}) {
  return (
    <div className="page">
      <section className="panel">
        <PanelTitle
          title="Settings"
          subtitle="Trading and account preferences"
        />

        <div className="settingsGrid">
          <SettingInput
            label="Demo account balance"
            value={balance}
            onChange={(e) =>
              setBalance(e.target.value)
            }
          />

          <div>
            <label>Symbol</label>

            <select
              value={symbol}
              onChange={(e) =>
                setSymbol(e.target.value)
              }
            >
              <option>XAUUSD</option>
              <option>EURUSD</option>
              <option>GBPUSD</option>
              <option>USDJPY</option>
            </select>
          </div>

          <SettingInput
            label="Risk per trade %"
            value={risk}
            onChange={(e) =>
              setRisk(e.target.value)
            }
          />

          <SettingInput
            label="Maximum daily loss %"
            value={dailyLoss}
            onChange={(e) =>
              setDailyLoss(e.target.value)
            }
          />

          <SettingInput
            label="Maximum open trades"
            value={maxTrades}
            onChange={(e) =>
              setMaxTrades(e.target.value)
            }
          />

          <div>
            <label>Trading mode</label>

            <select
              value={tradeMode}
              onChange={(e) =>
                setTradeMode(e.target.value)
              }
            >
              <option value="AUTO">
                AUTO TRADE
              </option>

              <option value="SIGNAL">
                SIGNAL ONLY
              </option>

              <option value="MANUAL">
                MANUAL
              </option>
            </select>
          </div>

          <div>
            <label>Analysis</label>

            <select
              value={analysisMode}
              onChange={(e) =>
                setAnalysisMode(e.target.value)
              }
            >
              <option value="ENGINE">
                ENGINE
              </option>

              <option value="AI">
                AI
              </option>
            </select>
          </div>

          <SettingInput
            label="Martingale"
            value="OFF"
            disabled
          />
        </div>

        <div className="successBox">
          🔐 API keys and broker credentials will
          never be stored in this frontend.
        </div>
      </section>
    </div>
  );
}

function Card({
  title,
  value,
  sub
}) {
  return (
    <div className="accountCard">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}

function PanelTitle({
  title,
  subtitle
}) {
  return (
    <div className="panelTitle">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function RiskRow({
  label,
  value
}) {
  return (
    <div className="riskRow">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function QuickButton({
  icon,
  title,
  onClick
}) {
  return (
    <button
      className="quickButton"
      onClick={onClick}
    >
      <span>{icon}</span>
      {title}
    </button>
  );
}

function Stat({
  label,
  value
}) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SettingInput({
  label,
  value,
  onChange,
  disabled = false
}) {
  return (
    <div>
      <label>{label}</label>

      <input
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

function EmptyState({
  title,
  text
}) {
  return (
    <div className="page">
      <section className="panel emptyContent">
        <h3>{title}</h3>
        <p>{text}</p>
      </section>
    </div>
  );
}

function pageTitle(page) {
  const titles = {
    dashboard: "Dashboard",
    bot: "My Bot",
    auto: "Auto Trade",
    signals: "Signals",
    manual: "Manual Trade",
    analysis: "Analysis",
    bots: "Available Bots",
    news: "Market News",
    history: "Trade History",
    settings: "Settings"
  };

  return titles[page] || "Dashboard";
}

createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
