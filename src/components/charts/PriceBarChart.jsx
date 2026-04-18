import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-main)" }} className="px-3.5 py-2.5 rounded-xl shadow-lg">
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{label}</p>
        <p className="text-sm font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>${payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function PriceBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-2xl shadow-sm border h-full" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
        <div className="h-[280px] flex items-center justify-center">
          <div className="w-8 h-8 border-3 rounded-full animate-spin" style={{ borderColor: "var(--border-main)", borderTopColor: "var(--accent)" }}></div>
        </div>
      </div>
    );
  }

  const categoryData = data.reduce((acc, p) => { if (!acc[p.category]) acc[p.category] = { total: 0, count: 0 }; acc[p.category].total += p.price; acc[p.category].count++; return acc; }, {});
  const chartData = Object.keys(categoryData).map((key) => ({ category: key.charAt(0).toUpperCase() + key.slice(1), avgPrice: Math.round(categoryData[key].total / categoryData[key].count) }));

  return (
    <div className="p-6 rounded-2xl shadow-sm border h-full transition-colors duration-300" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
      <div className="mb-5">
        <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Avg Price by Category</h3>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Comparing average product values</p>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
            <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--bg-primary)" }} />
            <Bar dataKey="avgPrice" fill="var(--accent)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
