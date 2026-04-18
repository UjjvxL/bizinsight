import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Bitcoin, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { getCryptoPrices } from "../services/api";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-main)" }} className="px-4 py-3 rounded-xl shadow-lg">
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{label}</p>
        <p className="text-base font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const cryptoStats = [
  { name: "Ethereum", symbol: "ETH", price: "$3,245.80", change: "+3.2%", positive: true },
  { name: "Solana", symbol: "SOL", price: "$142.50", change: "-1.8%", positive: false },
  { name: "Cardano", symbol: "ADA", price: "$0.62", change: "+5.1%", positive: true },
  { name: "Polkadot", symbol: "DOT", price: "$7.85", change: "+0.9%", positive: true },
  { name: "Avalanche", symbol: "AVAX", price: "$35.20", change: "-2.4%", positive: false },
];

export default function MarketTrends() {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(14);

  const fetchData = async (days) => {
    setLoading(true);
    const data = await getCryptoPrices(days);
    setCryptoData(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(timeRange); }, [timeRange]);

  const priceChange = cryptoData.length > 1 ? cryptoData[cryptoData.length - 1].price - cryptoData[0].price : 0;
  const isPositive = priceChange >= 0;
  const pctChange = cryptoData.length > 1 ? ((priceChange / cryptoData[0].price) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Market Trends</h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Track cryptocurrency prices and market movements</p>
      </div>

      {/* Bitcoin Card */}
      <div className="rounded-2xl p-6 shadow-sm border animate-fade-in-up-delay-1 transition-colors duration-300"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: "linear-gradient(135deg, var(--accent-gold), var(--gradient-to))" }}>
              <Bitcoin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Bitcoin (BTC)</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {cryptoData.length > 0 ? `$${cryptoData[cryptoData.length - 1].price.toLocaleString()}` : "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg"
              style={{ color: isPositive ? "var(--accent-green)" : "var(--accent-red)", backgroundColor: isPositive ? "rgba(91,154,111,0.1)" : "rgba(199,92,92,0.1)" }}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isPositive ? "+" : ""}{pctChange}%
            </div>
            <button onClick={() => fetchData(timeRange)}
              className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all"
              style={{ borderColor: "var(--border-main)", color: "var(--text-secondary)" }}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          {[7, 14, 30].map((days) => (
            <button key={days} onClick={() => setTimeRange(days)}
              className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: timeRange === days ? "var(--accent)" : "var(--bg-primary)",
                color: timeRange === days ? "#ffffff" : "var(--text-secondary)",
                border: timeRange === days ? "none" : "1px solid var(--border-main)",
              }}>
              {days}D
            </button>
          ))}
        </div>

        <div className="h-[350px] w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-3 rounded-full animate-spin" style={{ borderColor: "var(--border-main)", borderTopColor: "var(--accent)" }}></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cryptoData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isPositive ? "var(--accent-green)" : "var(--accent-red)"} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={isPositive ? "var(--accent-green)" : "var(--accent-red)"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="price" stroke={isPositive ? "var(--accent-green)" : "var(--accent-red)"} strokeWidth={2.5} fillOpacity={1} fill="url(#trendGrad)" dot={false} activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Crypto Table */}
      <div className="rounded-2xl shadow-sm border animate-fade-in-up-delay-2 transition-colors duration-300"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
        <div className="p-6 pb-0">
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Other Cryptocurrencies</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Market overview of top assets</p>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                {["Asset", "Symbol", "Price", "24h Change"].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider px-6 py-3" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cryptoStats.map((coin, idx) => (
                <tr key={idx} className="transition-colors"
                  style={{ borderBottom: idx < cryptoStats.length - 1 ? "1px solid var(--border-light)" : "none" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                  <td className="px-6 py-3.5"><span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{coin.name}</span></td>
                  <td className="px-6 py-3.5"><span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-primary)" }}>{coin.symbol}</span></td>
                  <td className="px-6 py-3.5"><span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{coin.price}</span></td>
                  <td className="px-6 py-3.5">
                    <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: coin.positive ? "var(--accent-green)" : "var(--accent-red)" }}>
                      {coin.positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}{coin.change}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
