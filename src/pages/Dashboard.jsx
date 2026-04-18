import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import KPICards from "../components/KPICards";
import CryptoLineChart from "../components/charts/CryptoLineChart";
import CategoryPieChart from "../components/charts/CategoryPieChart";
import PriceBarChart from "../components/charts/PriceBarChart";
import RecentTransactions from "../components/RecentTransactions";
import { getProducts, getCryptoPrices } from "../services/api";
import { exportPDF, exportCSV } from "../services/export";
import { generateInsights } from "../services/insights";
import storage from "../services/storage";
import { FileDown, FileText, Plus, X, Lightbulb, Upload, LayoutGrid, TrendingUp, TrendingDown, Edit2, Trash2, Check, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const [productData, setProductData] = useState([]);
  const [cryptoData, setCryptoData] = useState([]);
  const [kpiData, setKpiData] = useState({});
  const [loading, setLoading] = useState(true);
  const [customKPIs, setCustomKPIs] = useState(() => storage.get("custom_kpis", []));
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [kpiForm, setKpiForm] = useState({ title: "", value: "", trend: "", isPositive: true });
  const [editKpiId, setEditKpiId] = useState(null);
  const [insights, setInsights] = useState([]);
  const [csvData, setCsvData] = useState(null);
  const [csvName, setCsvName] = useState("");
  const [widgets, setWidgets] = useState(() => storage.get("dashboard_widgets", { crypto: true, pie: true, bar: true, transactions: true, insights: true, csv: false }));
  const [showWidgetPanel, setShowWidgetPanel] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { storage.set("custom_kpis", customKPIs); }, [customKPIs]);
  useEffect(() => { storage.set("dashboard_widgets", widgets); }, [widgets]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [products, cryptos] = await Promise.all([getProducts(), getCryptoPrices(14)]);
      setProductData(products);
      setCryptoData(cryptos);
      const totalItems = products.length;
      const averagePrice = products.reduce((acc, p) => acc + p.price, 0) / totalItems;
      const currentBtcPrice = cryptos.length > 0 ? cryptos[cryptos.length - 1].price : null;
      setKpiData({ totalProducts: totalItems, avgPrice: averagePrice, btcPrice: currentBtcPrice ? Math.round(currentBtcPrice) : null });
      // Generate AI insights
      const portfolio = storage.get("portfolio_holdings", []);
      setInsights(generateInsights(cryptos, products, portfolio));
      setLoading(false);
    };
    fetchData();
  }, []);

  const addOrEditKPI = () => {
    if (!kpiForm.title || !kpiForm.value) return;
    if (editKpiId) {
      setCustomKPIs(customKPIs.map((k) => k.id === editKpiId ? { ...k, ...kpiForm } : k));
      setEditKpiId(null);
    } else {
      setCustomKPIs([...customKPIs, { id: Date.now().toString(), ...kpiForm }]);
    }
    setShowKPIModal(false);
    setKpiForm({ title: "", value: "", trend: "", isPositive: true });
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
      const rows = lines.slice(1).map((line) => {
        const vals = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        const obj = {};
        headers.forEach((h, i) => { obj[h] = isNaN(vals[i]) ? vals[i] : parseFloat(vals[i]); });
        return obj;
      });
      setCsvData({ headers, rows });
      setWidgets((w) => ({ ...w, csv: true }));
    };
    reader.readAsText(file);
  };

  const toggleWidget = (key) => setWidgets((w) => ({ ...w, [key]: !w[key] }));

  const insightColors = { positive: "var(--accent-green)", warning: "var(--accent-red)", info: "var(--accent)" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Analytics Overview</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Your personalized business & crypto dashboard</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button onClick={() => setShowWidgetPanel(!showWidgetPanel)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)", color: "var(--text-primary)" }}>
            <LayoutGrid className="w-3.5 h-3.5" /> Widgets
          </button>
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)", color: "var(--text-primary)" }}>
            <Upload className="w-3.5 h-3.5" /> Upload CSV
            <input ref={fileRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          </label>
          <button onClick={() => exportCSV(productData, cryptoData)} disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all shadow-sm disabled:opacity-50"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)", color: "var(--text-primary)" }}>
            <FileDown className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={() => exportPDF(productData, cryptoData, kpiData)} disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* Widget Toggle Panel */}
      {showWidgetPanel && (
        <div className="rounded-2xl p-4 shadow-sm border animate-fade-in-up"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Dashboard Widgets</h4>
            <button onClick={() => setShowWidgetPanel(false)} style={{ color: "var(--text-muted)" }}><X className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "crypto", label: "Crypto Chart" },
              { key: "pie", label: "Category Pie" },
              { key: "bar", label: "Price Bar" },
              { key: "transactions", label: "Transactions" },
              { key: "insights", label: "AI Insights" },
              { key: "csv", label: "CSV Data" },
            ].map((w) => (
              <button key={w.key} onClick={() => toggleWidget(w.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: widgets[w.key] ? "var(--accent)" : "var(--bg-primary)",
                  color: widgets[w.key] ? "#fff" : "var(--text-secondary)",
                  border: `1px solid ${widgets[w.key] ? "transparent" : "var(--border-main)"}`,
                }}>
                {widgets[w.key] ? "✓ " : ""}{w.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-32 rounded-2xl"></div>)}</div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 skeleton h-[380px] rounded-2xl"></div>
            <div className="skeleton h-[380px] rounded-2xl"></div>
          </div>
        </div>
      ) : (
        <>
          {/* System KPI Cards */}
          <KPICards data={kpiData} />

          {/* Custom KPI Cards Row */}
          {customKPIs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up">
              {customKPIs.map((kpi) => (
                <div key={kpi.id} className="rounded-2xl p-4 shadow-sm border relative group transition-all hover:shadow-md"
                  style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button onClick={() => { setKpiForm(kpi); setEditKpiId(kpi.id); setShowKPIModal(true); }}
                      className="p-1 rounded" style={{ color: "var(--text-muted)" }}><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => setCustomKPIs(customKPIs.filter((k) => k.id !== kpi.id))}
                      className="p-1 rounded" style={{ color: "var(--accent-red)" }}><Trash2 className="w-3 h-3" /></button>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>{kpi.title}</p>
                  <h3 className="text-xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{kpi.value}</h3>
                  {kpi.trend && (
                    <div className="flex items-center gap-1 mt-2">
                      {kpi.isPositive ? <TrendingUp className="w-3 h-3" style={{ color: "var(--accent-green)" }} /> : <TrendingDown className="w-3 h-3" style={{ color: "var(--accent-red)" }} />}
                      <span className="text-xs font-semibold" style={{ color: kpi.isPositive ? "var(--accent-green)" : "var(--accent-red)" }}>{kpi.trend}</span>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => { setKpiForm({ title: "", value: "", trend: "", isPositive: true }); setEditKpiId(null); setShowKPIModal(true); }}
                className="rounded-2xl p-4 border-2 border-dashed flex items-center justify-center gap-2 text-xs font-medium transition-all hover:shadow-sm group"
                style={{ borderColor: "var(--border-main)", color: "var(--text-muted)" }}>
                <Plus className="w-4 h-4" /> Add KPI
              </button>
            </div>
          )}

          {customKPIs.length === 0 && (
            <button onClick={() => setShowKPIModal(true)}
              className="w-full rounded-2xl p-3 border-2 border-dashed flex items-center justify-center gap-2 text-xs font-medium transition-all hover:shadow-sm animate-fade-in-up"
              style={{ borderColor: "var(--border-main)", color: "var(--text-muted)" }}>
              <Plus className="w-4 h-4" /> Add Custom KPI Card (e.g., Monthly Revenue, User Count)
            </button>
          )}

          {/* AI Insights */}
          {widgets.insights && insights.length > 0 && (
            <div className="rounded-2xl shadow-sm border p-5 animate-fade-in-up-delay-1" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>AI-Powered Insights</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-white" style={{ backgroundColor: "var(--accent-gold)" }}>SMART</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {insights.map((insight, i) => (
                  <div key={i} className="p-4 rounded-xl border-l-[3px]" style={{ borderColor: insightColors[insight.type], backgroundColor: "var(--bg-primary)" }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{insight.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{insight.detail}</p>
                    <span className="inline-block text-[9px] uppercase tracking-wider mt-2 px-2 py-0.5 rounded" style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-surface-warm)" }}>{insight.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in-up-delay-2">
            {widgets.crypto && <div className="lg:col-span-2"><CryptoLineChart data={cryptoData} /></div>}
            {widgets.pie && <div><CategoryPieChart data={productData} /></div>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-fade-in-up-delay-3">
            {widgets.bar && <div className="lg:col-span-2"><PriceBarChart data={productData} /></div>}
            {widgets.transactions && <div className="lg:col-span-3"><RecentTransactions /></div>}
          </div>

          {/* CSV Upload Chart */}
          {widgets.csv && csvData && (
            <div className="rounded-2xl p-6 shadow-sm border animate-fade-in-up" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" style={{ color: "var(--accent)" }} />
                    <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Uploaded Data: {csvName}</h3>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{csvData.rows.length} rows × {csvData.headers.length} columns</p>
                </div>
                <button onClick={() => { setCsvData(null); setWidgets((w) => ({ ...w, csv: false })); }}
                  style={{ color: "var(--text-muted)" }}><X className="w-4 h-4" /></button>
              </div>

              {/* Auto-chart: bar chart of first numeric column grouped by first string column */}
              {(() => {
                const numCol = csvData.headers.find((h) => typeof csvData.rows[0]?.[h] === "number");
                const strCol = csvData.headers.find((h) => typeof csvData.rows[0]?.[h] === "string");
                if (!numCol || !strCol) {
                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr>{csvData.headers.map((h) => <th key={h} className="text-left px-3 py-2 text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>{h}</th>)}</tr></thead>
                        <tbody>{csvData.rows.slice(0, 20).map((row, i) => <tr key={i}>{csvData.headers.map((h) => <td key={h} className="px-3 py-2 text-xs" style={{ color: "var(--text-primary)" }}>{row[h]}</td>)}</tr>)}</tbody>
                      </table>
                    </div>
                  );
                }
                return (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={csvData.rows.slice(0, 30)} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} barSize={28}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                        <XAxis dataKey={strCol} axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-main)", borderRadius: "12px" }} />
                        <Bar dataKey={numCol} fill="var(--accent)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}

      {/* KPI Modal */}
      {showKPIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowKPIModal(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="relative rounded-2xl shadow-2xl border max-w-sm w-full animate-fade-in-up"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{editKpiId ? "Edit" : "Add"} Custom KPI</h3>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Title</label>
                <input type="text" value={kpiForm.title} onChange={(e) => setKpiForm({ ...kpiForm, title: e.target.value })}
                  placeholder="e.g., Monthly Revenue" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Value</label>
                <input type="text" value={kpiForm.value} onChange={(e) => setKpiForm({ ...kpiForm, value: e.target.value })}
                  placeholder="e.g., $12,400" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Trend</label>
                  <input type="text" value={kpiForm.trend} onChange={(e) => setKpiForm({ ...kpiForm, trend: e.target.value })}
                    placeholder="e.g., +8.5%" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                    style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Direction</label>
                  <div className="flex gap-2 mt-1">
                    {[true, false].map((v) => (
                      <button key={String(v)} onClick={() => setKpiForm({ ...kpiForm, isPositive: v })}
                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                        style={{ backgroundColor: kpiForm.isPositive === v ? (v ? "var(--accent-green)" : "var(--accent-red)") : "var(--bg-input)", color: kpiForm.isPositive === v ? "#fff" : "var(--text-secondary)", border: `1px solid ${kpiForm.isPositive === v ? "transparent" : "var(--border-main)"}` }}>
                        {v ? "↑ Up" : "↓ Down"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={addOrEditKPI} disabled={!kpiForm.title || !kpiForm.value}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all shadow-sm disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
                <Check className="w-4 h-4 inline mr-1" /> {editKpiId ? "Save Changes" : "Add KPI"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
