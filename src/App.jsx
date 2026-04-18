import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import MarketTrends from "./pages/MarketTrends";
import Inventory from "./pages/Inventory";
import SettingsPage from "./pages/Settings";
import HelpSupport from "./pages/HelpSupport";
import SearchResults from "./pages/SearchResults";
import Portfolio from "./pages/Portfolio";
import LoginPage from "./pages/LoginPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "var(--border-main)", borderTopColor: "var(--accent)" }}></div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto transition-colors duration-300" style={{ backgroundColor: "var(--bg-primary)" }}>
          <div className="max-w-[1400px] mx-auto p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/market-trends" element={<MarketTrends />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpSupport />} />
              <Route path="/search" element={<SearchResults />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
