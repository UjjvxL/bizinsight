import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS_VAR = ["var(--accent)", "var(--accent-gold)", "var(--accent-green)", "var(--text-muted)"];
const COLORS_HEX_FALLBACK = ["#8a7a6b", "#c9a96e", "#5b9a6f", "#b5a898"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-main)" }} className="px-3.5 py-2.5 rounded-xl shadow-lg">
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{payload[0].name}</p>
        <p className="text-sm font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>{payload[0].value} items</p>
      </div>
    );
  }
  return null;
};

export default function CategoryPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-2xl shadow-sm border h-full" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
        <div className="h-[320px] flex items-center justify-center">
          <div className="w-8 h-8 border-3 rounded-full animate-spin" style={{ borderColor: "var(--border-main)", borderTopColor: "var(--accent)" }}></div>
        </div>
      </div>
    );
  }

  const categoryCounts = data.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
  const chartData = Object.keys(categoryCounts).map((key) => ({ name: key.charAt(0).toUpperCase() + key.slice(1), value: categoryCounts[key] }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="p-6 rounded-2xl shadow-sm border h-full flex flex-col transition-colors duration-300" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
      <div className="mb-4">
        <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Inventory Distribution</h3>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{total} total products</p>
      </div>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
              {chartData.map((_, i) => <Cell key={i} fill={COLORS_HEX_FALLBACK[i % COLORS_HEX_FALLBACK.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-2">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS_HEX_FALLBACK[idx % COLORS_HEX_FALLBACK.length] }}></span>
              <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
            </div>
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
