import { MessageCircle, Book, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const faqs = [
  { q: "How does BizInsight fetch real-time data?", a: "BizInsight connects to public APIs like CoinGecko for cryptocurrency prices and FakeStore API for e-commerce product data. If any API is unavailable, the dashboard seamlessly switches to realistic fallback data." },
  { q: "Can I export my dashboard reports?", a: "Yes! Use the 'Export PDF' or 'Export CSV' buttons on the Dashboard page to download snapshots of your analytics data." },
  { q: "How do I change my notification preferences?", a: "Navigate to Settings → Notifications. You can toggle email notifications, push notifications, and weekly report summaries on or off." },
  { q: "Is my data stored securely?", a: "BizInsight processes all data client-side. No personal data is stored on external servers. API calls are made directly from your browser." },
  { q: "What browsers are supported?", a: "BizInsight works best on modern browsers including Chrome, Firefox, Safari, and Edge (latest versions)." },
];

export default function HelpSupport() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Help & Support</h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Find answers to common questions or reach out for support</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in-up-delay-1">
        {[
          { icon: Book, title: "Documentation", desc: "Browse guides & tutorials", color: "from-[var(--gradient-from)] to-[var(--gradient-to)]" },
          { icon: MessageCircle, title: "Live Chat", desc: "Talk to our support team", color: "from-[var(--accent-gold)] to-[#a8894f]" },
          { icon: Mail, title: "Email Support", desc: "support@bizinsight.com", color: "from-[var(--accent-green)] to-[#3d7a52]" },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="rounded-2xl p-5 shadow-sm border flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300"
                style={{ background: `linear-gradient(135deg, var(--gradient-from), var(--gradient-to))` }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{card.title}</h4>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl shadow-sm border animate-fade-in-up-delay-2 transition-colors duration-300"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
        <div className="p-6 pb-0">
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Frequently Asked Questions</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Quick answers to common queries</p>
        </div>
        <div className="p-6 space-y-2">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border-light)" }}>
              <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                <span className="text-sm font-medium pr-4" style={{ color: "var(--text-primary)" }}>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />}
              </button>
              {openFaq === idx && <div className="px-4 pb-4"><p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{faq.a}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
