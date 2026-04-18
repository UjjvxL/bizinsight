import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import axios from "axios";

// Fallback generator for any coin
const generateFallbackData = (coinName, days = 14) => {
  const data = [];
  const basePrices = {
    bitcoin: 62000, ethereum: 3200, solana: 140, cardano: 0.6,
    dogecoin: 0.15, polkadot: 7.5, avalanche: 35, chainlink: 14,
    polygon: 0.7, litecoin: 82,
  };
  let price = basePrices[coinName.toLowerCase()] || 50 + Math.random() * 500;

  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    price = price * (1 + (Math.random() - 0.48) * 0.06);
    if (price < 0.01) price = 0.01;
    data.push({
      timestamp: d.getTime(),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: Number(price.toFixed(price > 100 ? 0 : price > 1 ? 2 : 4)),
    });
  }
  return data;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-main)" }}
        className="px-4 py-3 rounded-xl shadow-lg">
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{label}</p>
        <p className="text-base font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>
          ${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 4 })}
        </p>
      </div>
    );
  }
  return null;
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coinInfo, setCoinInfo] = useState(null);
  const [timeRange, setTimeRange] = useState(14);

  const fetchCoinData = async (days) => {
    setLoading(true);
    try {
      // Try to search for the coin on CoinGecko
      const searchRes = await axios.get(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
        { timeout: 5000 }
      );
      const coin = searchRes.data?.coins?.[0];
      if (!coin) throw new Error("Not found");

      setCoinInfo({ name: coin.name, symbol: coin.symbol, thumb: coin.large || coin.thumb });

      // Fetch market chart
      const chartRes = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=${days}`,
        { timeout: 5000 }
      );

      const formatted = chartRes.data.prices.map((item) => {
        const date = new Date(item[0]);
        return {
          timestamp: item[0],
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          price: Number(item[1].toFixed(item[1] > 100 ? 0 : item[1] > 1 ? 2 : 4)),
        };
      });

      const step = Math.max(1, Math.ceil(formatted.length / days));
      setData(formatted.filter((_, i) => i % step === 0 || i === formatted.length - 1));
    } catch (err) {
      console.warn("Using fallback data for:", query, err.message);
      setCoinInfo({ name: query.charAt(0).toUpperCase() + query.slice(1), symbol: query.substring(0, 4).toUpperCase(), thumb: null });
      setData(generateFallbackData(query, days));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) fetchCoinData(timeRange);
  }, [query, timeRange]);

  const priceChange = data.length > 1 ? data[data.length - 1].price - data[0].price : 0;
  const isPositive = priceChange >= 0;
  const pctChange = data.length > 1 ? ((priceChange / data[0].price) * 100).toFixed(2) : 0;
  const currentPrice = data.length > 0 ? data[data.length - 1].price : null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: "var(--text-secondary)" }}>
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Coin Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-4">
          {coinInfo?.thumb && (
            <img src={coinInfo.thumb} alt={coinInfo.name} className="w-12 h-12 rounded-full" />
          )}
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {coinInfo?.name || query} {coinInfo?.symbol && <span className="text-base font-normal" style={{ color: "var(--text-muted)" }}>({coinInfo.symbol})</span>}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Price chart and market data
            </p>
          </div>
        </div>
      </div>

      {/* Chart Card */}
      <div className="rounded-2xl p-6 shadow-sm border animate-fade-in-up-delay-1"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {currentPrice !== null ? `$${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}` : "—"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {isPositive ? <TrendingUp className="w-4 h-4" style={{ color: "var(--accent-green)" }} /> : <TrendingDown className="w-4 h-4" style={{ color: "var(--accent-red)" }} />}
              <span className="text-sm font-semibold" style={{ color: isPositive ? "var(--accent-green)" : "var(--accent-red)" }}>
                {isPositive ? "+" : ""}{pctChange}% ({isPositive ? "+" : ""}${Math.abs(priceChange).toLocaleString(undefined, { maximumFractionDigits: 4 })})
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>past {timeRange} days</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[7, 14, 30, 90].map((d) => (
              <button key={d} onClick={() => setTimeRange(d)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  backgroundColor: timeRange === d ? "var(--accent)" : "var(--bg-primary)",
                  color: timeRange === d ? "#ffffff" : "var(--text-secondary)",
                  borderColor: timeRange === d ? "transparent" : "var(--border-main)",
                  border: timeRange === d ? "none" : "1px solid var(--border-main)",
                }}>
                {d}D
              </button>
            ))}
            <button onClick={() => fetchCoinData(timeRange)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
              style={{ borderColor: "var(--border-main)", color: "var(--text-secondary)" }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="h-[400px] w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-3 rounded-full animate-spin" style={{ borderColor: "var(--border-main)", borderTopColor: "var(--accent)" }}></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="searchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isPositive ? "var(--accent-green)" : "var(--accent-red)"} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={isPositive ? "var(--accent-green)" : "var(--accent-red)"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  tickFormatter={(v) => v > 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="price" stroke={isPositive ? "var(--accent-green)" : "var(--accent-red)"}
                  strokeWidth={2.5} fillOpacity={1} fill="url(#searchGrad)" dot={false}
                  activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
