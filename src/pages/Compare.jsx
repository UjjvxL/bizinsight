/**
 * Compare — Side-by-side data comparison with chart overlays.
 * Compare crypto coins, time periods, or custom metrics.
 */
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { GitCompareArrows, TrendingUp, TrendingDown, ArrowRight, RefreshCw } from "lucide-react";
import { getCryptoPrices } from "../services/api";
import axios from "axios";

const COINS = [
  { id: "bitcoin", label: "Bitcoin", symbol: "BTC", color: "#f7931a" },
  { id: "ethereum", label: "Ethereum", symbol: "ETH", color: "#627eea" },
  { id: "solana", label: "Solana", symbol: "SOL", color: "#9945ff" },
  { id: "cardano", label: "Cardano", symbol: "ADA", color: "#0d1e30" },
  { id: "dogecoin", label: "Dogecoin", symbol: "DOGE", color: "#c2a633" },
  { id: "ripple", label: "Ripple", symbol: "XRP", color: "#00aae4" },
  { id: "polkadot", label: "Polkadot", symbol: "DOT", color: "#e6007a" },
  { id: "avalanche-2", label: "Avalanche", symbol: "AVAX", color: "#e84142" },
];

const TIME_RANGES = [
  { value: 7, label: "7 Days" },
  { value: 14, label: "14 Days" },
  { value: 30, label: "30 Days" },
  { value: 90, label: "90 Days" },
];

async function fetchCoinHistory(coinId, days) {
  try {
    const res = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      { timeout: 6000 }
    );
    return res.data.prices.map(([ts, price]) => ({
      date: new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      timestamp: ts,
      price,
    }));
  } catch {
    // Generate mock data
    const base = coinId === "bitcoin" ? 68000 : coinId === "ethereum" ? 3200 : coinId === "solana" ? 140 : 50;
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      timestamp: Date.now() - (days - i) * 86400000,
      price: base * (1 + (Math.random() - 0.45) * 0.02 * i),
    }));
  }
}

export default function Compare() {
  const [coinA, setCoinA] = useState("bitcoin");
  const [coinB, setCoinB] = useState("ethereum");
  const [days, setDays] = useState(30);
  const [dataA, setDataA] = useState([]);
  const [dataB, setDataB] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("overlay"); // overlay | normalized

  const coinAInfo = COINS.find((c) => c.id === coinA) || COINS[0];
  const coinBInfo = COINS.find((c) => c.id === coinB) || COINS[1];

  const fetchData = async () => {
    setLoading(true);
    const [a, b] = await Promise.all([fetchCoinHistory(coinA, days), fetchCoinHistory(coinB, days)]);
    setDataA(a);
    setDataB(b);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [coinA, coinB, days]);

  // Merge data for chart
  const mergedData = dataA.map((d, i) => {
    const bPrice = dataB[i]?.price || 0;
    if (mode === "normalized") {
      const baseA = dataA[0]?.price || 1;
      const baseB = dataB[0]?.price || 1;
      return { date: d.date, [coinAInfo.symbol]: ((d.price / baseA) * 100).toFixed(2), [coinBInfo.symbol]: ((bPrice / baseB) * 100).toFixed(2) };
    }
    return { date: d.date, [coinAInfo.symbol]: d.price, [coinBInfo.symbol]: bPrice };
  });

  // Stats
  const statsA = dataA.length > 1 ? { start: dataA[0].price, end: dataA[dataA.length - 1].price, change: ((dataA[dataA.length - 1].price - dataA[0].price) / dataA[0].price * 100) } : null;
  const statsB = dataB.length > 1 ? { start: dataB[0].price, end: dataB[dataB.length - 1].price, change: ((dataB[dataB.length - 1].price - dataB[0].price) / dataB[0].price * 100) } : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Compare</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Side-by-side crypto performance comparison</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all shadow-sm"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)", color: "var(--text-primary)" }}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Selectors */}
      <div className="flex flex-wrap items-center gap-3 animate-fade-in-up-delay-1">
        <select value={coinA} onChange={(e) => setCoinA(e.target.value)}
          className="px-4 py-2.5 rounded-xl border text-sm outline-none font-medium"
          style={{ borderColor: coinAInfo.color, backgroundColor: "var(--bg-surface)", color: "var(--text-primary)", borderWidth: "2px" }}>
          {COINS.map((c) => <option key={c.id} value={c.id}>{c.label} ({c.symbol})</option>)}
        </select>

        <span className="px-3 py-2 rounded-xl" style={{ backgroundColor: "var(--bg-hover)" }}>
          <GitCompareArrows className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
        </span>

        <select value={coinB} onChange={(e) => setCoinB(e.target.value)}
          className="px-4 py-2.5 rounded-xl border text-sm outline-none font-medium"
          style={{ borderColor: coinBInfo.color, backgroundColor: "var(--bg-surface)", color: "var(--text-primary)", borderWidth: "2px" }}>
          {COINS.map((c) => <option key={c.id} value={c.id}>{c.label} ({c.symbol})</option>)}
        </select>

        <div className="flex gap-1 ml-auto">
          {TIME_RANGES.map((r) => (
            <button key={r.value} onClick={() => setDays(r.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ backgroundColor: days === r.value ? "var(--accent)" : "var(--bg-surface)", color: days === r.value ? "#fff" : "var(--text-secondary)", border: `1px solid ${days === r.value ? "transparent" : "var(--border-main)"}` }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 animate-fade-in-up-delay-1">
        {[{ key: "overlay", label: "Price Overlay" }, { key: "normalized", label: "% Performance (Normalized)" }].map((m) => (
          <button key={m.key} onClick={() => setMode(m.key)}
            className="px-4 py-2 rounded-xl text-xs font-medium transition-all border"
            style={{ backgroundColor: mode === m.key ? "var(--bg-hover)" : "transparent", color: mode === m.key ? "var(--text-primary)" : "var(--text-muted)", borderColor: mode === m.key ? "var(--accent)" : "var(--border-main)" }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      {statsA && statsB && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up-delay-2">
          {[{ info: coinAInfo, stats: statsA }, { info: coinBInfo, stats: statsB }].map(({ info, stats }) => (
            <div key={info.id} className="rounded-2xl p-5 shadow-sm border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }}></span>
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{info.label}</span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{info.symbol}</span>
                </div>
                {stats.change >= 0 ? <TrendingUp className="w-4 h-4" style={{ color: "var(--accent-green)" }} /> : <TrendingDown className="w-4 h-4" style={{ color: "var(--accent-red)" }} />}
              </div>
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Current</p>
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>${stats.end.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                </div>
                <ArrowRight className="w-4 h-4 mb-1.5" style={{ color: "var(--text-muted)" }} />
                <div>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{days}d Change</p>
                  <p className="text-lg font-bold" style={{ color: stats.change >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                    {stats.change >= 0 ? "+" : ""}{stats.change.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="rounded-2xl p-6 shadow-sm border animate-fade-in-up-delay-3" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          {mode === "normalized" ? "% Performance from Start" : "Price Comparison (USD)"}
        </h3>
        {loading ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="w-8 h-8 border-3 rounded-full animate-spin" style={{ borderColor: "var(--border-main)", borderTopColor: "var(--accent)" }}></div>
          </div>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mergedData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                  tickFormatter={(v) => mode === "normalized" ? `${v}%` : `$${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toFixed(0)}`} />
                <Tooltip contentStyle={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-main)", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(val, name) => [mode === "normalized" ? `${Number(val).toFixed(2)}%` : `$${Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, name]} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line type="monotone" dataKey={coinAInfo.symbol} stroke={coinAInfo.color} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey={coinBInfo.symbol} stroke={coinBInfo.color} strokeWidth={2.5} dot={false} strokeDasharray={mode === "overlay" ? "0" : "0"} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Key Insight */}
      {statsA && statsB && !loading && (
        <div className="rounded-2xl p-5 border-l-[3px] animate-fade-in-up-delay-3"
          style={{ borderColor: "var(--accent-gold)", backgroundColor: "var(--bg-surface)" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>💡 Comparison Insight</p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Over the last {days} days, <strong>{coinAInfo.label}</strong> {statsA.change >= 0 ? "gained" : "lost"} {Math.abs(statsA.change).toFixed(1)}%
            while <strong>{coinBInfo.label}</strong> {statsB.change >= 0 ? "gained" : "lost"} {Math.abs(statsB.change).toFixed(1)}%.
            {Math.abs(statsA.change) > Math.abs(statsB.change)
              ? ` ${coinAInfo.symbol} showed stronger momentum in this period.`
              : ` ${coinBInfo.symbol} showed stronger momentum in this period.`}
          </p>
        </div>
      )}
    </div>
  );
}
