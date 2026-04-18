import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { getReportConfig, saveReportConfig, prepareReportData, generateReportHTML, FREQUENCY_OPTIONS, DAY_OPTIONS } from "../services/reports";
import { fetchGoogleSheet } from "../services/sheets";
import storage from "../services/storage";
import { User, Bell, Palette, Shield, Globe, Save, Monitor, Sun, Moon, Link, FileSpreadsheet, Mail, Clock, Trash2, Database, Info, CheckCircle2, AlertCircle, Eye } from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "integrations", label: "Integrations", icon: Link },
  { id: "reports", label: "Email Reports", icon: Mail },
  { id: "data", label: "Data", icon: Database },
  { id: "security", label: "Security", icon: Shield },
  { id: "language", label: "Language", icon: Globe },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState(() => storage.get("notification_prefs", { email: true, push: true, weekly: false, priceAlerts: true }));

  // Google Sheets
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetResult, setSheetResult] = useState(null);
  const [sheetError, setSheetError] = useState("");

  // Email Reports
  const [reportConfig, setReportConfig] = useState(() => getReportConfig());
  const [showPreview, setShowPreview] = useState(false);

  const flashSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const saveNotifications = () => { storage.set("notification_prefs", notifications); flashSaved(); };

  const handleFetchSheet = async () => {
    if (!sheetUrl.trim()) return;
    setSheetLoading(true);
    setSheetError("");
    setSheetResult(null);
    try {
      const data = await fetchGoogleSheet(sheetUrl);
      setSheetResult(data);
    } catch (err) {
      setSheetError(err.message);
    }
    setSheetLoading(false);
  };

  const saveReportSettings = () => { saveReportConfig(reportConfig); flashSaved(); };

  const clearAllData = () => {
    if (!window.confirm("Are you sure? This will delete all your custom KPIs, portfolio holdings, products, and settings.")) return;
    ["custom_kpis", "portfolio_holdings", "custom_products", "dashboard_widgets", "price_alerts", "email_report_config", "notification_prefs"].forEach((k) => storage.remove(k));
    flashSaved();
  };

  const themes = [
    { value: "beige", name: "Beige", desc: "Warm & elegant", colors: ["#f9f6f1", "#8a7a6b", "#c9a96e"] },
    { value: "light", name: "Light", desc: "Clean & corporate", colors: ["#f8fafc", "#4a7cff", "#f59e0b"] },
    { value: "dark", name: "Dark", desc: "Sleek & modern", colors: ["#0f0f1a", "#7c6faa", "#a855f7"] },
  ];

  const cardStyle = { backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" };
  const inputStyle = { borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Settings</h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Manage your account, preferences, and integrations</p>
      </div>

      {/* Success Toast */}
      {saved && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg animate-fade-in-up text-sm font-medium text-white" style={{ backgroundColor: "var(--accent-green)" }}>
          <CheckCircle2 className="w-4 h-4" /> Settings saved
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in-up-delay-1">
        {/* Tabs */}
        <div className="rounded-2xl shadow-sm border p-3 h-fit" style={cardStyle}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm text-left"
                style={{
                  backgroundColor: activeTab === tab.id ? "var(--bg-hover)" : "transparent",
                  color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                }}>
                <Icon className="w-4 h-4" style={{ color: activeTab === tab.id ? "var(--accent)" : "inherit" }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 rounded-2xl shadow-sm border p-6" style={cardStyle}>

          {/* Profile */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Full Name</label>
                  <input type="text" defaultValue={user?.displayName || "Jane Doe"} className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Email</label>
                  <input type="email" defaultValue={user?.email || "user@bizinsight.com"} className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Role</label>
                <input type="text" defaultValue="Administrator" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={inputStyle} />
              </div>
              <button onClick={flashSaved} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Notification Preferences</h3>
              {[
                { key: "email", label: "Email Notifications", desc: "Receive updates about your portfolio via email" },
                { key: "push", label: "Push Notifications", desc: "Browser notifications for price alerts" },
                { key: "weekly", label: "Weekly Digest", desc: "Summary of portfolio changes every Monday" },
                { key: "priceAlerts", label: "Price Alert Notifications", desc: "Instant alerts when targets are hit" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <div><p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</p></div>
                  <button onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
                    className="w-11 h-6 rounded-full transition-all relative" style={{ backgroundColor: notifications[key] ? "var(--accent-green)" : "var(--border-main)" }}>
                    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all" style={{ left: notifications[key] ? "22px" : "2px" }}></span>
                  </button>
                </div>
              ))}
              <button onClick={saveNotifications} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          )}

          {/* Appearance */}
          {activeTab === "appearance" && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {themes.map((t) => (
                  <button key={t.value} onClick={() => setTheme(t.value)}
                    className="p-4 rounded-xl border-2 text-left transition-all hover:shadow-md"
                    style={{ borderColor: theme === t.value ? "var(--accent)" : "var(--border-main)", backgroundColor: theme === t.value ? "var(--bg-hover)" : "transparent" }}>
                    <div className="flex gap-1.5 mb-3">
                      {t.colors.map((c, i) => <span key={i} className="w-5 h-5 rounded-full border" style={{ backgroundColor: c, borderColor: "var(--border-main)" }}></span>)}
                    </div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.desc}</p>
                    {theme === t.value && <span className="inline-block text-[10px] mt-2 px-2 py-0.5 rounded-full text-white font-semibold" style={{ backgroundColor: "var(--accent)" }}>Active</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Integrations */}
          {activeTab === "integrations" && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Google Sheets Integration</h3>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Connect a Google Sheet to auto-generate charts. First, publish your sheet: <strong>File → Share → Publish to Web → CSV</strong>, then paste the URL below.
              </p>
              <div className="flex gap-2">
                <div className="flex items-center flex-1 px-4 py-2.5 rounded-xl border" style={inputStyle}>
                  <FileSpreadsheet className="w-4 h-4 mr-2.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                  <input type="url" value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..." className="bg-transparent border-none outline-none text-sm w-full" style={{ color: "var(--text-primary)" }} />
                </div>
                <button onClick={handleFetchSheet} disabled={sheetLoading || !sheetUrl.trim()}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
                  {sheetLoading ? "Loading..." : "Connect"}
                </button>
              </div>
              {sheetError && <p className="text-xs flex items-center gap-1" style={{ color: "var(--accent-red)" }}><AlertCircle className="w-3.5 h-3.5" />{sheetError}</p>}
              {sheetResult && (
                <div className="rounded-xl p-4 border" style={{ borderColor: "var(--accent-green)", backgroundColor: "var(--bg-primary)" }}>
                  <p className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--accent-green)" }}><CheckCircle2 className="w-4 h-4" /> Sheet connected!</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{sheetResult.rows.length} rows × {sheetResult.headers.length} columns ({sheetResult.headers.join(", ")})</p>
                  <div className="overflow-x-auto mt-3 max-h-40">
                    <table className="w-full text-xs">
                      <thead><tr>{sheetResult.headers.map((h) => <th key={h} className="text-left px-2 py-1 font-semibold" style={{ color: "var(--text-muted)" }}>{h}</th>)}</tr></thead>
                      <tbody>{sheetResult.rows.slice(0, 5).map((row, i) => <tr key={i}>{sheetResult.headers.map((h) => <td key={h} className="px-2 py-1" style={{ color: "var(--text-primary)" }}>{row[h]}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--border-light)" }}>
                <h3 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Other Integrations</h3>
                {[
                  { name: "Shopify", desc: "Import store data & orders", status: "Coming soon" },
                  { name: "Stripe", desc: "Payment & revenue analytics", status: "Coming soon" },
                  { name: "Gumroad", desc: "Digital product sales data", status: "Coming soon" },
                ].map((int) => (
                  <div key={int.name} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <div><p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{int.name}</p><p className="text-xs" style={{ color: "var(--text-muted)" }}>{int.desc}</p></div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}>{int.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Reports */}
          {activeTab === "reports" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Scheduled Email Reports</h3>
                <button onClick={() => setReportConfig((c) => ({ ...c, enabled: !c.enabled }))}
                  className="w-11 h-6 rounded-full transition-all relative" style={{ backgroundColor: reportConfig.enabled ? "var(--accent-green)" : "var(--border-main)" }}>
                  <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all" style={{ left: reportConfig.enabled ? "22px" : "2px" }}></span>
                </button>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Receive automated PDF reports of your dashboard metrics via email.</p>

              {reportConfig.enabled && (
                <div className="space-y-4 p-4 rounded-xl" style={{ backgroundColor: "var(--bg-primary)" }}>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Email Address</label>
                    <input type="email" value={reportConfig.email} onChange={(e) => setReportConfig((c) => ({ ...c, email: e.target.value }))}
                      placeholder="your@email.com" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={inputStyle} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>Frequency</label>
                    <div className="flex gap-2">
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <button key={opt.value} onClick={() => setReportConfig((c) => ({ ...c, frequency: opt.value }))}
                          className="flex-1 p-3 rounded-xl text-left transition-all border" style={{
                            backgroundColor: reportConfig.frequency === opt.value ? "var(--bg-hover)" : "transparent",
                            borderColor: reportConfig.frequency === opt.value ? "var(--accent)" : "var(--border-main)",
                          }}>
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{opt.label}</p>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  {reportConfig.frequency === "weekly" && (
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Day of Week</label>
                      <select value={reportConfig.dayOfWeek} onChange={(e) => setReportConfig((c) => ({ ...c, dayOfWeek: parseInt(e.target.value) }))}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={inputStyle}>
                        {DAY_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                    <input type="time" value={reportConfig.timeOfDay} onChange={(e) => setReportConfig((c) => ({ ...c, timeOfDay: e.target.value }))}
                      className="px-4 py-2 rounded-xl border text-sm outline-none" style={inputStyle} />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={saveReportSettings} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white"
                      style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
                      <Save className="w-4 h-4" /> Save
                    </button>
                    <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border"
                      style={{ borderColor: "var(--border-main)", color: "var(--text-primary)" }}>
                      <Eye className="w-4 h-4" /> Preview
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl flex items-start gap-3" style={{ backgroundColor: "var(--bg-primary)" }}>
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  Email delivery requires a backend service (Supabase Edge Functions + Resend, or Vercel Cron + SendGrid). 
                  See <code className="px-1 py-0.5 rounded text-[10px]" style={{ backgroundColor: "var(--bg-hover)" }}>src/services/reports.js</code> for setup instructions.
                </p>
              </div>
            </div>
          )}

          {/* Data Management */}
          {activeTab === "data" && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Data Management</h3>

              <div className="space-y-3">
                {[
                  { key: "portfolio_holdings", label: "Portfolio Holdings", icon: "💰" },
                  { key: "custom_kpis", label: "Custom KPIs", icon: "📊" },
                  { key: "custom_products", label: "Custom Products", icon: "📦" },
                  { key: "price_alerts", label: "Price Alerts", icon: "🔔" },
                  { key: "dashboard_widgets", label: "Widget Preferences", icon: "🧩" },
                ].map((item) => {
                  const data = storage.get(item.key, []);
                  const count = Array.isArray(data) ? data.length : "configured";
                  return (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: "var(--border-light)" }}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{count} {typeof count === "number" ? "items" : ""}</p>
                        </div>
                      </div>
                      <button onClick={() => { storage.remove(item.key); flashSaved(); }} className="text-xs px-3 py-1.5 rounded-lg border"
                        style={{ borderColor: "var(--border-main)", color: "var(--accent-red)" }}>Clear</button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4" style={{ borderTop: "1px solid var(--border-light)" }}>
                <button onClick={clearAllData} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white" style={{ backgroundColor: "var(--accent-red)" }}>
                  <Trash2 className="w-4 h-4" /> Clear All Data
                </button>
                <p className="text-[11px] mt-2" style={{ color: "var(--text-muted)" }}>This will permanently delete all your custom data. This cannot be undone.</p>
              </div>

              <div className="pt-4" style={{ borderTop: "1px solid var(--border-light)" }}>
                <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Storage Backend</h4>
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-primary)" }}>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Using <strong>localStorage</strong> — data is stored in your browser only</span>
                </div>
                <p className="text-[11px] mt-2" style={{ color: "var(--text-muted)" }}>
                  To sync across devices, connect Supabase in <code className="px-1 py-0.5 rounded text-[10px]" style={{ backgroundColor: "var(--bg-hover)" }}>src/services/supabase.js</code>
                </p>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Security</h3>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Current Password</label>
                <input type="password" placeholder="Enter current password" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={inputStyle} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>New Password</label>
                  <input type="password" placeholder="New password" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Confirm Password</label>
                  <input type="password" placeholder="Confirm new password" className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={inputStyle} />
                </div>
              </div>
              <button onClick={flashSaved} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
                <Save className="w-4 h-4" /> Update Password
              </button>
            </div>
          )}

          {/* Language */}
          {activeTab === "language" && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Language & Region</h3>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Display Language</label>
                <select className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={inputStyle} defaultValue="en">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="hi">हिंदी</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Currency</label>
                <select className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none" style={inputStyle} defaultValue="usd">
                  <option value="usd">USD ($)</option>
                  <option value="eur">EUR (€)</option>
                  <option value="gbp">GBP (£)</option>
                  <option value="inr">INR (₹)</option>
                  <option value="jpy">JPY (¥)</option>
                </select>
              </div>
              <button onClick={flashSaved} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Report Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="relative rounded-2xl shadow-2xl border max-w-lg w-full max-h-[80vh] overflow-y-auto animate-fade-in-up"
            style={{ backgroundColor: "#fff", borderColor: "var(--border-main)" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-4 flex justify-between items-center" style={{ borderBottom: "1px solid #e8e2d9" }}>
              <h3 className="text-sm font-semibold" style={{ color: "#2d2a26" }}>Email Report Preview</h3>
              <button onClick={() => setShowPreview(false)} className="text-xs px-3 py-1 rounded-lg" style={{ color: "#7d7469" }}>Close</button>
            </div>
            <div dangerouslySetInnerHTML={{ __html: generateReportHTML(prepareReportData()) }} />
          </div>
        </div>
      )}
    </div>
  );
}
