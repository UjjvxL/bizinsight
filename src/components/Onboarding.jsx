/**
 * Onboarding — Guided tutorial overlay for first-time users.
 * Steps highlight areas of the UI with tooltips and a progress indicator.
 */
import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles, Rocket } from "lucide-react";
import storage from "../services/storage";

const STEPS = [
  {
    title: "Welcome to BizInsight! 🎉",
    desc: "Your personal business analytics dashboard. Let's take a quick tour of the key features.",
    target: null,
    position: "center",
  },
  {
    title: "📊 Dashboard Overview",
    desc: "This is your command center. See Bitcoin prices, product analytics, and AI-powered insights all in one place.",
    target: "dashboard",
    position: "center",
  },
  {
    title: "📈 Custom KPI Cards",
    desc: "Click '+ Add Custom KPI Card' to track YOUR metrics — Monthly Revenue, User Count, anything you want!",
    target: "kpi-area",
    position: "bottom",
  },
  {
    title: "💰 Crypto Portfolio",
    desc: "Navigate to the Portfolio page to add your crypto holdings. Track live prices, profit/loss, and set price alerts.",
    target: "portfolio-nav",
    position: "right",
  },
  {
    title: "🧩 Widget Customization",
    desc: "Click the 'Widgets' button to show/hide dashboard sections. Upload CSV files to create custom charts.",
    target: "widgets-area",
    position: "bottom",
  },
  {
    title: "🎨 Themes & Settings",
    desc: "Head to Settings to switch between Beige, Light, and Dark themes. Configure integrations and email reports.",
    target: "settings-nav",
    position: "right",
  },
  {
    title: "🤖 AI Insights",
    desc: "Scroll down on the dashboard to see smart insights generated from your data — no API key needed!",
    target: "insights-area",
    position: "top",
  },
  {
    title: "🚀 You're All Set!",
    desc: "Start by adding your first crypto holding or custom KPI. BizInsight gets smarter the more you use it.",
    target: null,
    position: "center",
  },
];

export default function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = storage.get("onboarding_complete", false);
    if (!seen) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const complete = () => {
    storage.set("onboarding_complete", true);
    setShow(false);
  };

  const next = () => { if (step < STEPS.length - 1) setStep(step + 1); else complete(); };
  const prev = () => { if (step > 0) setStep(step - 1); };

  if (!show) return null;

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={complete}></div>

      {/* Card */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative max-w-md w-full rounded-2xl shadow-2xl border pointer-events-auto animate-fade-in-up overflow-hidden"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>

          {/* Progress bar */}
          <div className="h-1 w-full" style={{ backgroundColor: "var(--border-light)" }}>
            <div className="h-full rounded-r-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}></div>
          </div>

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {isFirst ? <Sparkles className="w-5 h-5" style={{ color: "var(--accent-gold)" }} /> : isLast ? <Rocket className="w-5 h-5" style={{ color: "var(--accent-green)" }} /> : null}
                <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{current.title}</h3>
              </div>
              <button onClick={complete} className="p-1 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
              {current.desc}
            </p>

            {/* Step indicator */}
            <div className="flex items-center gap-1.5 mb-5">
              {STEPS.map((_, i) => (
                <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? "20px" : "8px",
                    backgroundColor: i === step ? "var(--accent)" : i < step ? "var(--accent-green)" : "var(--border-main)",
                  }}></div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <button onClick={complete} className="text-xs font-medium transition-colors" style={{ color: "var(--text-muted)" }}>
                Skip tour
              </button>
              <div className="flex gap-2">
                {!isFirst && (
                  <button onClick={prev}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-all"
                    style={{ borderColor: "var(--border-main)", color: "var(--text-primary)" }}>
                    <ChevronLeft className="w-3.5 h-3.5" /> Back
                  </button>
                )}
                <button onClick={next}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-medium text-white transition-all shadow-sm"
                  style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
                  {isLast ? "Get Started" : "Next"} {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Reset onboarding — call this from Settings to replay the tour
 */
export function resetOnboarding() {
  storage.remove("onboarding_complete");
}
