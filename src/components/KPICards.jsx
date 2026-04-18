import { TrendingUp, TrendingDown, DollarSign, Package, Bitcoin } from "lucide-react";

export default function KPICards({ data }) {
  const { totalProducts, avgPrice, btcPrice } = data;

  const kpis = [
    { title: "Bitcoin Price", value: btcPrice ? `$${btcPrice.toLocaleString()}` : "—", subtitle: "Current market value", trend: "+12.5%", isPositive: true, icon: Bitcoin },
    { title: "Total Products", value: totalProducts || "—", subtitle: "Active inventory items", trend: "+2.1%", isPositive: true, icon: Package },
    { title: "Avg Product Value", value: avgPrice ? `$${avgPrice.toFixed(2)}` : "—", subtitle: "Across all categories", trend: "-0.5%", isPositive: false, icon: DollarSign },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx}
            className={`animate-fade-in-up-delay-${idx + 1} rounded-2xl p-5 shadow-sm border flex items-start justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group`}
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>{kpi.title}</p>
              <h3 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{kpi.value}</h3>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{kpi.subtitle}</p>
              <div className="flex items-center gap-1.5 mt-3">
                {kpi.isPositive ? <TrendingUp className="w-3.5 h-3.5" style={{ color: "var(--accent-green)" }} /> : <TrendingDown className="w-3.5 h-3.5" style={{ color: "var(--accent-red)" }} />}
                <span className="text-xs font-semibold" style={{ color: kpi.isPositive ? "var(--accent-green)" : "var(--accent-red)" }}>{kpi.trend}</span>
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>vs last week</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl flex justify-center items-center shadow-sm group-hover:scale-105 transition-transform duration-300"
              style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
