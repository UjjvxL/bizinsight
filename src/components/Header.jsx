import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Calendar, X, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const notifications = [
  { id: 1, text: "Bitcoin price crossed $68,000", time: "2 min ago", unread: true },
  { id: 2, text: "Weekly report is ready to download", time: "1 hour ago", unread: true },
  { id: 3, text: "5 new products added to inventory", time: "3 hours ago", unread: false },
  { id: 4, text: "System maintenance scheduled for Sunday", time: "1 day ago", unread: false },
];

const pageSuggestions = [
  { label: "Dashboard", path: "/" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Market Trends", path: "/market-trends" },
  { label: "Inventory", path: "/inventory" },
  { label: "Products", path: "/inventory" },
  { label: "Settings", path: "/settings" },
  { label: "Integrations", path: "/settings" },
  { label: "Help & Support", path: "/help" },
];

const cryptoSuggestions = [
  "Bitcoin", "Ethereum", "Solana", "Cardano", "Dogecoin",
  "Polkadot", "Avalanche", "Chainlink", "Polygon", "Litecoin",
  "Ripple", "Shiba Inu", "Toncoin", "Tron", "Uniswap",
];

export default function Header() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Combine page + crypto suggestions
  const getFilteredResults = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();

    const pages = pageSuggestions.filter((s) => s.label.toLowerCase().includes(q))
      .map((s) => ({ ...s, type: "page" }));

    const cryptos = cryptoSuggestions.filter((c) => c.toLowerCase().includes(q))
      .map((c) => ({ label: c, path: `/search?q=${encodeURIComponent(c)}`, type: "crypto" }));

    return [...pages, ...cryptos].slice(0, 8);
  };

  const handleSelect = (item) => {
    navigate(item.path);
    setSearchQuery("");
    setSearchOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const cycleTheme = () => {
    const order = ["beige", "light", "dark"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-16 backdrop-blur-md border-b flex items-center justify-between px-8 sticky top-0 z-10"
      style={{ backgroundColor: "var(--header-bg)", borderColor: "var(--border-main)" }}>
      {/* Search Bar */}
      <div className="relative" ref={searchRef}>
        <form onSubmit={handleSearchSubmit}>
          <div className="flex items-center px-4 py-2 rounded-xl border w-80 transition-all duration-200 focus-within:ring-2"
            style={{
              backgroundColor: "var(--bg-input)",
              borderColor: "var(--border-main)",
            }}>
            <Search className="w-4 h-4 mr-2.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search crypto, pages..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              className="bg-transparent border-none outline-none text-sm w-full"
              style={{ color: "var(--text-primary)" }}
            />
            {searchQuery && (
              <button type="button" onClick={() => { setSearchQuery(""); setSearchOpen(false); }} style={{ color: "var(--text-muted)" }}>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {searchOpen && getFilteredResults().length > 0 && (
          <div className="absolute top-full left-0 mt-2 w-80 rounded-xl shadow-lg border overflow-hidden z-50 animate-fade-in-up"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
            {getFilteredResults().map((item, idx) => (
              <button key={idx} onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 border-b last:border-0 transition-colors"
                style={{ color: "var(--text-primary)", borderColor: "var(--border-light)" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    color: item.type === "crypto" ? "var(--accent-gold)" : "var(--accent)",
                    backgroundColor: item.type === "crypto" ? "rgba(201,169,110,0.1)" : "rgba(138,122,107,0.1)",
                  }}>
                  {item.type === "crypto" ? "CRYPTO" : "PAGE"}
                </span>
                {item.label}
              </button>
            ))}
            {searchQuery.trim() && (
              <button onClick={handleSearchSubmit}
                className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors"
                style={{ color: "var(--accent)", borderTop: "1px solid var(--border-light)" }}>
                Search for "{searchQuery}" →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Date */}
        <div className="hidden lg:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border"
          style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-primary)", borderColor: "var(--border-main)" }}>
          <Calendar className="w-3.5 h-3.5" />
          {today}
        </div>

        {/* Theme Toggle */}
        <button onClick={cycleTheme} title={`Theme: ${theme}`}
          className="w-9 h-9 rounded-xl flex justify-center items-center transition-all duration-200 border"
          style={{ color: "var(--text-secondary)", borderColor: "transparent" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-hover)"; e.currentTarget.style.borderColor = "var(--border-main)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}>
          <ThemeIcon className="w-[18px] h-[18px]" />
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen(!notifOpen)}
            className="w-9 h-9 rounded-xl flex justify-center items-center transition-all duration-200 relative border"
            style={{ color: "var(--text-secondary)", borderColor: "transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-hover)"; e.currentTarget.style.borderColor = "var(--border-main)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}>
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full ring-2"
                style={{ backgroundColor: "var(--accent-red)", ringColor: "var(--bg-surface)" }}></span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 rounded-xl shadow-lg border overflow-hidden z-50 animate-fade-in-up"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
              <div className="px-4 py-3 border-b flex items-center justify-between"
                style={{ borderColor: "var(--border-light)" }}>
                <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Notifications</h4>
                <span className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "var(--accent)" }}>{unreadCount} new</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id}
                    className="px-4 py-3 border-b last:border-0 transition-colors cursor-pointer"
                    style={{ borderColor: "var(--border-light)", backgroundColor: notif.unread ? "var(--bg-surface-warm)" : "transparent" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.unread ? "var(--bg-surface-warm)" : "transparent"}>
                    <div className="flex items-start gap-3">
                      {notif.unread && <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: "var(--accent)" }}></span>}
                      <div className={notif.unread ? "" : "ml-5"}>
                        <p className="text-sm" style={{ color: "var(--text-primary)", fontWeight: notif.unread ? 500 : 400 }}>{notif.text}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t text-center" style={{ borderColor: "var(--border-light)" }}>
                <button onClick={() => { navigate("/settings"); setNotifOpen(false); }}
                  className="text-xs font-medium transition-colors" style={{ color: "var(--accent)" }}>
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
