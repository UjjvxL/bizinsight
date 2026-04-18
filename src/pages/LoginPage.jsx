import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import Logo from "../components/Logo";

export default function LoginPage() {
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await signup(form.email, form.password, form.name);
      } else {
        await login(form.email, form.password);
      }
      navigate("/");
    } catch (err) {
      const code = err.code || "";
      if (code.includes("user-not-found") || code.includes("wrong-password") || code.includes("invalid-credential")) {
        setError("Invalid email or password.");
      } else if (code.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else if (code.includes("weak-password")) {
        setError("Password must be at least 6 characters.");
      } else if (code.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      if (!err.code?.includes("popup-closed")) {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))` }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/20 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        </div>
        <div className="relative z-10 px-16 text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <Logo size={48} />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">BizInsight</h1>
              <p className="text-xs tracking-widest uppercase opacity-70">Analytics Dashboard</p>
            </div>
          </div>
          <p className="text-lg opacity-90 leading-relaxed mb-6">
            Visualize your business data with interactive charts. Track cryptocurrency trends,
            manage inventory, and generate actionable insights.
          </p>
          <div className="flex gap-3">
            {["Real-time Data", "Interactive Charts", "Smart Insights"].map((tag) => (
              <span key={tag} className="text-[11px] px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Logo size={40} />
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>BizInsight</h1>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            {isSignUp ? "Create an account" : "Welcome back"}
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            {isSignUp ? "Sign up to start using BizInsight" : "Sign in to your dashboard"}
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-5 text-sm"
              style={{ backgroundColor: "var(--accent-red)", color: "#fff" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border text-sm font-medium transition-all duration-200 hover:shadow-sm disabled:opacity-50"
            style={{ borderColor: "var(--border-main)", color: "var(--text-primary)", backgroundColor: "var(--bg-surface)" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-[1px]" style={{ backgroundColor: "var(--border-main)" }}></div>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>or</span>
            <div className="flex-1 h-[1px]" style={{ backgroundColor: "var(--border-main)" }}></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Doe" required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                    style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@example.com" required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                  style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                <input type={showPassword ? "text" : "password"} value={form.password}
                  onChange={(e) => update("password", e.target.value)} placeholder="••••••••" required minLength={6}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm outline-none transition-all"
                  style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))` }}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
