# BizInsight – Business Analytics Dashboard

A modern, full-featured business analytics dashboard built with **React**, **Vite**, and **Tailwind CSS**. Visualize cryptocurrency market trends, manage product inventory, and generate professional reports — all in a sleek, themeable interface.

![BizInsight Dashboard](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-8-purple) ![Tailwind](https://img.shields.io/badge/TailwindCSS-4-cyan)

## ✨ Features

- **📊 Real-Time Data** — Live cryptocurrency prices from CoinGecko API + e-commerce data from FakeStore API
- **🔍 Crypto Search** — Search any cryptocurrency and view interactive price charts with 7D/14D/30D/90D ranges
- **🎨 3 Themes** — Beige (warm), Light (corporate blue), Dark (purple accents) — switch instantly
- **📄 Export Reports** — Download dashboard data as CSV or generate professional branded PDF reports
- **🔐 Authentication** — Firebase Auth with email/password and Google sign-in (demo mode included)
- **📱 Responsive Design** — Works across desktop and tablet viewports
- **⚡ Interactive Charts** — Area charts, pie charts, bar charts with tooltips and animations

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/bizinsight.git
cd bizinsight

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** and sign in with any email/password (demo mode).

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI Components |
| Vite 8 | Build Tool |
| Tailwind CSS v4 | Styling |
| Recharts | Charts & Graphs |
| React Router | Navigation |
| Axios | API Calls |
| Lucide React | Icons |
| jsPDF | PDF Export |
| Firebase | Authentication |

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Logo.jsx         # Custom SVG logo
│   ├── Header.jsx       # Search, themes, notifications
│   ├── Sidebar.jsx      # Navigation with auth
│   ├── KPICards.jsx      # Metric cards
│   └── charts/          # Recharts visualizations
├── context/             # React context providers
│   ├── ThemeContext.jsx  # Beige/Light/Dark themes
│   └── AuthContext.jsx   # Firebase auth wrapper
├── pages/               # Route pages
│   ├── Dashboard.jsx
│   ├── MarketTrends.jsx
│   ├── Inventory.jsx
│   ├── SearchResults.jsx
│   ├── Settings.jsx
│   └── LoginPage.jsx
├── services/            # API & utilities
│   ├── api.js           # CoinGecko + FakeStore
│   ├── export.js        # PDF/CSV generation
│   └── firebase.js      # Firebase config
└── index.css            # Theme variables & animations
```

## 🎨 Themes

The dashboard supports three beautiful themes that can be toggled from the header or Settings → Appearance:

- **Beige** — Warm, elegant earth tones (default)
- **Light** — Clean corporate blue
- **Dark** — Sleek dark mode with purple accents

## 🔐 Authentication Setup

The app runs in **Demo Mode** by default. To use real Firebase auth:

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password and Google sign-in
3. Copy your config to `src/services/firebase.js`
4. Set `DEMO_MODE = false` in `src/context/AuthContext.jsx`

## 📦 Deployment

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.

## 📄 License

MIT License — Feel free to use this for your portfolio or projects.
