# 📊 BizInsight — Business Analytics Dashboard

> **A sleek, production-ready analytics dashboard** for solopreneurs, crypto investors, and small businesses. Track crypto portfolios, manage inventory, create custom KPIs, and get AI-powered business insights — all in one beautiful interface.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/UjjvxL/bizinsight)

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 💰 **Crypto Portfolio Tracker** | Add holdings (BTC, ETH, SOL...), track live prices, view P&L, set price alerts |
| 📊 **Custom KPI Cards** | Add your own metrics — "Monthly Revenue: $24,500 ↑12.3%" |
| 🤖 **AI-Powered Insights** | Smart analysis: "Bitcoin is up 13.3% — consider profit-taking" |
| 📈 **Data Comparison** | Bitcoin vs Ethereum side-by-side, overlay or normalized % view |
| 👥 **Team Collaboration** | Share dashboards via link, comment on metrics, invite team members |
| 📤 **CSV Upload & Charting** | Upload any spreadsheet → auto-generates bar charts |
| 🎨 **3 Premium Themes** | Beige (warm), Light (corporate), Dark (sleek) |
| 💱 **Multi-Currency** | USD, EUR, GBP, INR, JPY — auto-detected from browser locale |
| 📱 **PWA / Installable** | Add to phone home screen, check portfolio in 2 seconds |
| 📧 **Scheduled Reports** | Configure daily/weekly/monthly email reports with preview |
| 🏪 **Google Sheets Integration** | Connect published sheets for live data charts |
| 🧭 **Onboarding Tutorial** | 8-step guided tour for first-time users |

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS v4 + CSS Variables theming
- **Charts**: Recharts
- **Auth**: Firebase (Demo mode available)
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Export**: jsPDF + file-saver
- **APIs**: CoinGecko (crypto prices), FakeStore (products)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/UjjvxL/bizinsight.git
cd bizinsight

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — Login with demo credentials or any email/password in demo mode.

---

## 📂 Project Structure

```
src/
├── components/
│   ├── Header.jsx          # Search bar, notifications, theme toggle
│   ├── Sidebar.jsx         # Navigation menu
│   ├── Onboarding.jsx      # 8-step guided tutorial
│   ├── Logo.jsx            # Custom SVG logo
│   └── charts/             # Crypto line, price bar, category pie
├── pages/
│   ├── Dashboard.jsx       # KPIs, AI insights, CSV upload, widgets
│   ├── Portfolio.jsx       # Crypto portfolio tracker + price alerts
│   ├── Compare.jsx         # Side-by-side coin comparison
│   ├── Collaboration.jsx   # Share, comment, team management
│   ├── Inventory.jsx       # Product CRUD + API data
│   ├── MarketTrends.jsx    # Crypto market overview
│   ├── Settings.jsx        # 8 tabs: profile to integrations
│   └── LoginPage.jsx       # Firebase auth with demo mode
├── services/
│   ├── storage.js          # localStorage (Supabase-ready)
│   ├── crypto.js           # Live prices + coin search
│   ├── insights.js         # AI pattern analysis engine
│   ├── sheets.js           # Google Sheets CSV parser
│   ├── reports.js          # Email report generation
│   ├── supabase.js         # Supabase scaffolding
│   └── export.js           # PDF/CSV export
└── context/
    ├── ThemeContext.jsx     # Beige/Light/Dark themes
    ├── CurrencyContext.jsx  # Multi-currency with auto-detect
    └── AuthContext.jsx      # Firebase + demo mode
```

---

## 🔧 Configuration

### Enable Real Firebase Auth
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Update credentials in `src/services/firebase.js`
3. Set `DEMO_MODE = false` in `src/context/AuthContext.jsx`

### Enable Supabase Backend
1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schemas from `src/services/supabase.js`
3. Set `USE_SUPABASE = true` and add your credentials

---

## 📝 License

MIT — Free for personal and commercial use.

---

**Built with ❤️ using React, Vite, and Recharts**
