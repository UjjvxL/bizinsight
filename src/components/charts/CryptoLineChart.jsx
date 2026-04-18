import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

export default function CryptoLineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-2xl shadow-sm border h-full" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
        <div className="h-[320px] flex items-center justify-center">
          <div className="w-8 h-8 border-3 rounded-full animate-spin" style={{ borderColor: "var(--border-main)", borderTopColor: "var(--accent)" }}></div>
        </div>
      </div>
    );
  }

  const priceChange = data[data.length - 1].price - data[0].price;
  const isPositive = priceChange >= 0;

  return (
    <div className="p-6 rounded-2xl shadow-sm border h-full transition-colors duration-300" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Bitcoin Price Trend</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>14-day historical data</p>
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 rounded-lg"
          style={{ color: isPositive ? "var(--accent-green)" : "var(--accent-red)", backgroundColor: isPositive ? "rgba(91,154,111,0.1)" : "rgba(199,92,92,0.1)" }}>
          {isPositive ? "+" : ""}${Math.abs(priceChange).toLocaleString()}
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="cryptoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? "var(--accent-green)" : "var(--accent-red)"} stopOpacity={0.15} />
                <stop offset="100%" stopColor={isPositive ? "var(--accent-green)" : "var(--accent-red)"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="price" stroke={isPositive ? "var(--accent-green)" : "var(--accent-red)"} strokeWidth={2.5} fillOpacity={1} fill="url(#cryptoGradient)" dot={false} activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
