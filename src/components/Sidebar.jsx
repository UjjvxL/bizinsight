import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, ShoppingBag, TrendingUp, Settings, HelpCircle, LogOut, ChevronRight, Wallet, GitCompareArrows, Users } from "lucide-react";
import Logo from "./Logo";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Wallet, label: "Portfolio", path: "/portfolio" },
  { icon: GitCompareArrows, label: "Compare", path: "/compare" },
  { icon: TrendingUp, label: "Market Trends", path: "/market-trends" },
  { icon: ShoppingBag, label: "Inventory", path: "/inventory" },
  { icon: Users, label: "Collaborate", path: "/collaboration" },
];

const bottomItems = [
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: HelpCircle, label: "Help & Support", path: "/help" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <aside className="w-64 h-screen border-r flex flex-col fixed left-0 top-0 z-20 transition-colors duration-300"
      style={{ backgroundColor: "var(--sidebar-bg)", borderColor: "var(--border-main)" }}>
      {/* Logo */}
      <div className="p-6 pb-2">
        <NavLink to="/" className="flex items-center gap-3 group">
          <Logo size={36} className="shadow-md group-hover:scale-105 transition-transform duration-200" />
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>BizInsight</h1>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>Analytics</p>
          </div>
        </NavLink>
      </div>

      <div className="mx-5 my-3 h-[1px]" style={{ background: "linear-gradient(to right, transparent, var(--border-main), transparent)" }}></div>

      <nav className="flex-1 px-3 mt-2 space-y-1">
        <p className="text-[10px] uppercase tracking-wider font-semibold px-3 mb-3" style={{ color: "var(--text-muted)" }}>Main Menu</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} end={item.path === "/"}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
              style={({ isActive }) => ({
                background: isActive ? "linear-gradient(to right, var(--bg-hover), var(--bg-surface-warm))" : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: isActive ? 600 : 400,
                border: isActive ? "1px solid var(--border-main)" : "1px solid transparent",
                boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
              })}>
              {({ isActive }) => (
                <>
                  <Icon className="w-[18px] h-[18px]" style={{ color: isActive ? "var(--accent)" : "inherit" }} />
                  <span className="text-sm">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" style={{ color: "var(--text-muted)" }} />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-4 space-y-1">
        <div className="mx-2 mb-3 h-[1px]" style={{ background: "linear-gradient(to right, transparent, var(--border-main), transparent)" }}></div>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm"
              style={({ isActive }) => ({
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                background: isActive ? "linear-gradient(to right, var(--bg-hover), var(--bg-surface-warm))" : "transparent",
                fontWeight: isActive ? 600 : 400,
                border: isActive ? "1px solid var(--border-main)" : "1px solid transparent",
              })}>
              {({ isActive }) => (
                <>
                  <Icon className="w-[18px] h-[18px]" style={{ color: isActive ? "var(--accent)" : "inherit" }} />
                  {item.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" style={{ color: "var(--text-muted)" }} />}
                </>
              )}
            </NavLink>
          );
        })}

        {/* User Card */}
        <div className="mt-3 mx-1 p-3 rounded-xl border transition-colors duration-300"
          style={{ background: "linear-gradient(to right, var(--bg-primary), var(--bg-hover))", borderColor: "var(--border-main)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{displayName}</p>
              <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{user?.email?.substring(0, 22) || "Admin"}</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-lg transition-colors" title="Log out"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-red)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
