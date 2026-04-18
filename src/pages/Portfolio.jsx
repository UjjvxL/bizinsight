import { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Plus, Trash2, RefreshCw, TrendingUp, TrendingDown, Search, X, Wallet, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getLivePrices, searchCoins, TOP_COINS } from "../services/crypto";
import { useCurrency } from "../context/CurrencyContext";
import storage from "../services/storage";

const PIE_COLORS = ["#8a7a6b", "#c9a96e", "#5b9a6f", "#7c6faa", "#c75c5c", "#4a90d9", "#d4845a", "#5bb89a"];

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-main)" }} className="px-3 py-2 rounded-xl shadow-lg">
        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{payload[0].name}</p>
        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
      </div>
    );
  }
  return null;
};

export default function Portfolio() {
  const { format: fmt, symbol: currSymbol } = useCurrency();
  const [holdings, setHoldings] = useState(() => storage.get("portfolio_holdings", []));
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addForm, setAddForm] = useState({ coinId: "", name: "", symbol: "", amount: "", buyPrice: "" });
  const [alerts, setAlerts] = useState(() => storage.get("price_alerts", []));
  const [alertForm, setAlertForm] = useState({ coinId: "", symbol: "", targetPrice: "", direction: "below" });
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);

  // Persist holdings
  useEffect(() => { storage.set("portfolio_holdings", holdings); }, [holdings]);
  useEffect(() => { storage.set("price_alerts", alerts); }, [alerts]);

  // Fetch live prices
  const fetchPrices = useCallback(async () => {
    if (holdings.length === 0) return;
    setLoading(true);
    const ids = [...new Set(holdings.map((h) => h.coinId))];
    const data = await getLivePrices(ids);
    setPrices(data);
    setLoading(false);

    // Check price alerts
    const triggered = [];
    alerts.forEach((alert) => {
      const price = data[alert.coinId]?.usd;
      if (price) {
        if (alert.direction === "below" && price <= alert.targetPrice) {
          triggered.push({ ...alert, currentPrice: price });
        } else if (alert.direction === "above" && price >= alert.targetPrice) {
          triggered.push({ ...alert, currentPrice: price });
        }
      }
    });
    if (triggered.length > 0) {
      setTriggeredAlerts(triggered);
      if ("Notification" in window && Notification.permission === "granted") {
        triggered.forEach((a) => {
          new Notification(`BizInsight Price Alert`, {
            body: `${a.symbol} is now $${a.currentPrice.toLocaleString()} (${a.direction} $${a.targetPrice.toLocaleString()})`,
          });
        });
      }
    }
  }, [holdings, alerts]);

  useEffect(() => { fetchPrices(); const interval = setInterval(fetchPrices, 60000); return () => clearInterval(interval); }, [fetchPrices]);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Search coins
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchCoins(searchQuery);
      setSearchResults(results);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addHolding = () => {
    if (!addForm.coinId || !addForm.amount || !addForm.buyPrice) return;
    const newHolding = {
      id: Date.now().toString(),
      coinId: addForm.coinId,
      name: addForm.name,
      symbol: addForm.symbol,
      amount: parseFloat(addForm.amount),
      buyPrice: parseFloat(addForm.buyPrice),
    };
    setHoldings([...holdings, newHolding]);
    setShowAddModal(false);
    setAddForm({ coinId: "", name: "", symbol: "", amount: "", buyPrice: "" });
    setSearchQuery("");
  };

  const removeHolding = (id) => setHoldings(holdings.filter((h) => h.id !== id));

  const addAlert = () => {
    if (!alertForm.coinId || !alertForm.targetPrice) return;
    setAlerts([...alerts, { id: Date.now().toString(), ...alertForm, targetPrice: parseFloat(alertForm.targetPrice) }]);
    setShowAlertModal(false);
    setAlertForm({ coinId: "", symbol: "", targetPrice: "", direction: "below" });
  };

  const removeAlert = (id) => setAlerts(alerts.filter((a) => a.id !== id));

  // Calculate enriched holdings
  const enriched = holdings.map((h) => {
    const livePrice = prices[h.coinId]?.usd || h.buyPrice;
    const change24h = prices[h.coinId]?.usd_24h_change || 0;
    const currentValue = h.amount * livePrice;
    const totalCost = h.amount * h.buyPrice;
    const pnl = currentValue - totalCost;
    const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
    return { ...h, livePrice, change24h, currentValue, totalCost, pnl, pnlPct };
  });

  const totalValue = enriched.reduce((s, h) => s + h.currentValue, 0);
  const totalCost = enriched.reduce((s, h) => s + h.totalCost, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost * 100) : 0;

  const pieData = enriched.map((h) => ({ name: h.symbol, value: h.currentValue }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Crypto Portfolio</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Track your holdings and profit/loss in real-time</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAlertModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition-all shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)", color: "var(--text-primary)" }}>
            🔔 Price Alert
          </button>
          <button onClick={fetchPrices} disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all shadow-sm"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)", color: "var(--text-primary)" }}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white shadow-sm transition-all hover:shadow-md"
            style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
            <Plus className="w-3.5 h-3.5" /> Add Coin
          </button>
        </div>
      </div>

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <div className="rounded-xl p-4 border animate-fade-in-up" style={{ backgroundColor: "rgba(199,92,92,0.08)", borderColor: "var(--accent-red)" }}>
          <p className="text-sm font-semibold mb-2" style={{ color: "var(--accent-red)" }}>🚨 Price Alerts Triggered</p>
          {triggeredAlerts.map((a, i) => (
            <p key={i} className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {a.symbol} hit ${a.currentPrice.toLocaleString()} ({a.direction} your target of ${a.targetPrice.toLocaleString()})
            </p>
          ))}
          <button onClick={() => setTriggeredAlerts([])} className="text-xs mt-2 font-medium" style={{ color: "var(--accent)" }}>Dismiss</button>
        </div>
      )}

      {holdings.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border-2 border-dashed p-12 text-center animate-fade-in-up"
          style={{ borderColor: "var(--border-main)" }}>
          <Wallet className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No holdings yet</h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
            Add your crypto holdings to track real-time portfolio value, profit/loss, and get AI-powered insights.
          </p>
          <button onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
            <Plus className="w-4 h-4" /> Add Your First Coin
          </button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up-delay-1">
            {[
              { label: "Total Value", value: fmt(totalValue), icon: DollarSign, color: "var(--accent)" },
              { label: "Total Invested", value: fmt(totalCost), icon: Wallet, color: "var(--accent-gold)" },
              { label: "Total P&L", value: `${totalPnl >= 0 ? "+" : ""}${fmt(Math.abs(totalPnl))}`, icon: totalPnl >= 0 ? TrendingUp : TrendingDown, color: totalPnl >= 0 ? "var(--accent-green)" : "var(--accent-red)" },
              { label: "Return", value: `${totalPnlPct >= 0 ? "+" : ""}${totalPnlPct.toFixed(2)}%`, icon: BarChart3, color: totalPnlPct >= 0 ? "var(--accent-green)" : "var(--accent-red)" },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md"
                  style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>{card.label}</p>
                    <Icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                  <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
                </div>
              );
            })}
          </div>

          {/* Holdings Table + Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in-up-delay-2">
            <div className="lg:col-span-2 rounded-2xl shadow-sm border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
              <div className="p-5 pb-0">
                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Holdings</h3>
              </div>
              <div className="overflow-x-auto mt-3">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                      {["Coin", "Amount", "Avg Buy", "Live Price", "Value", "P&L", ""].map((h) => (
                        <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider px-5 py-2.5" style={{ color: "var(--text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {enriched.map((h) => (
                      <tr key={h.id} className="transition-colors" style={{ borderBottom: "1px solid var(--border-light)" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                        <td className="px-5 py-3">
                          <div>
                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{h.name}</p>
                            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{h.symbol}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{h.amount}</td>
                        <td className="px-5 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>${h.buyPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                        <td className="px-5 py-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>${h.livePrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                        <td className="px-5 py-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>${h.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            {h.pnl >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" style={{ color: "var(--accent-green)" }} /> : <ArrowDownRight className="w-3.5 h-3.5" style={{ color: "var(--accent-red)" }} />}
                            <span className="text-xs font-semibold" style={{ color: h.pnl >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                              {h.pnlPct >= 0 ? "+" : ""}{h.pnlPct.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <button onClick={() => removeHolding(h.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-red)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Distribution Pie */}
            <div className="rounded-2xl p-5 shadow-sm border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
              <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Allocation</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
                {enriched.map((h, i) => (
                  <div key={h.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                      <span style={{ color: "var(--text-secondary)" }}>{h.symbol}</span>
                    </div>
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{totalValue > 0 ? (h.currentValue / totalValue * 100).toFixed(1) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          {alerts.length > 0 && (
            <div className="rounded-2xl p-5 shadow-sm border animate-fade-in-up-delay-3" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
              <h3 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>🔔 Active Price Alerts</h3>
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-4 py-3 rounded-xl border" style={{ borderColor: "var(--border-light)" }}>
                    <div>
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{a.symbol}</span>
                      <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>Alert when {a.direction} ${a.targetPrice.toLocaleString()}</span>
                    </div>
                    <button onClick={() => removeAlert(a.id)} className="text-xs" style={{ color: "var(--accent-red)" }}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Coin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="relative rounded-2xl shadow-2xl border max-w-md w-full max-h-[80vh] overflow-y-auto animate-fade-in-up"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Add Crypto Holding</h3>
                <button onClick={() => setShowAddModal(false)} style={{ color: "var(--text-muted)" }}><X className="w-5 h-5" /></button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search coins (e.g., Bitcoin, ETH)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
              </div>

              {/* Search Results or Quick Picks */}
              {!addForm.coinId && (
                <div className="mb-4 max-h-48 overflow-y-auto space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                    {searchQuery ? "Results" : "Popular Coins"}
                  </p>
                  {(searchQuery ? searchResults : TOP_COINS).map((coin) => (
                    <button key={coin.id} onClick={() => { setAddForm({ ...addForm, coinId: coin.id, name: coin.name, symbol: coin.symbol }); setSearchQuery(""); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                      {coin.thumb && <img src={coin.thumb} alt="" className="w-6 h-6 rounded-full" />}
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>{coin.name}</span>
                      <span className="text-xs ml-auto font-mono" style={{ color: "var(--text-muted)" }}>{coin.symbol}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Coin Form */}
              {addForm.coinId && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-hover)" }}>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{addForm.name}</span>
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{addForm.symbol}</span>
                    <button onClick={() => setAddForm({ coinId: "", name: "", symbol: "", amount: "", buyPrice: "" })}
                      className="ml-auto text-xs" style={{ color: "var(--accent)" }}>Change</button>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Amount Held</label>
                    <input type="number" step="any" value={addForm.amount} onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                      placeholder="e.g., 0.5" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                      style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Average Buy Price (USD)</label>
                    <input type="number" step="any" value={addForm.buyPrice} onChange={(e) => setAddForm({ ...addForm, buyPrice: e.target.value })}
                      placeholder="e.g., 65000" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                      style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
                  </div>
                  <button onClick={addHolding} disabled={!addForm.amount || !addForm.buyPrice}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all shadow-sm disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
                    Add to Portfolio
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAlertModal(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="relative rounded-2xl shadow-2xl border max-w-sm w-full animate-fade-in-up"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Set Price Alert</h3>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Coin</label>
                <select value={alertForm.coinId}
                  onChange={(e) => { const c = TOP_COINS.find((t) => t.id === e.target.value); setAlertForm({ ...alertForm, coinId: e.target.value, symbol: c?.symbol || "" }); }}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}>
                  <option value="">Select coin</option>
                  {TOP_COINS.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Alert when price goes</label>
                <div className="flex gap-2">
                  {["below", "above"].map((d) => (
                    <button key={d} onClick={() => setAlertForm({ ...alertForm, direction: d })}
                      className="flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all"
                      style={{ backgroundColor: alertForm.direction === d ? "var(--accent)" : "var(--bg-input)", color: alertForm.direction === d ? "#fff" : "var(--text-secondary)", border: `1px solid ${alertForm.direction === d ? "transparent" : "var(--border-main)"}` }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Target Price ($)</label>
                <input type="number" step="any" value={alertForm.targetPrice} onChange={(e) => setAlertForm({ ...alertForm, targetPrice: e.target.value })}
                  placeholder="e.g., 60000" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
              </div>
              <button onClick={addAlert} disabled={!alertForm.coinId || !alertForm.targetPrice}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all shadow-sm disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
                Set Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
