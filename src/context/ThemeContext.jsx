import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const themes = {
  beige: {
    name: "Beige",
    "--bg-primary": "#f9f6f1",
    "--bg-surface": "#ffffff",
    "--bg-surface-warm": "#faf8f5",
    "--bg-hover": "#f3ede6",
    "--bg-input": "#faf8f5",
    "--text-primary": "#2d2a26",
    "--text-secondary": "#7d7469",
    "--text-muted": "#b5a898",
    "--border-main": "#e8e2d9",
    "--border-light": "#f0ebe4",
    "--accent": "#8a7a6b",
    "--accent-dark": "#665a4e",
    "--accent-gold": "#c9a96e",
    "--accent-green": "#5b9a6f",
    "--accent-red": "#c75c5c",
    "--sidebar-bg": "#ffffff",
    "--header-bg": "rgba(255,255,255,0.8)",
    "--gradient-from": "#8a7a6b",
    "--gradient-to": "#665a4e",
  },
  light: {
    name: "Light",
    "--bg-primary": "#f4f6f9",
    "--bg-surface": "#ffffff",
    "--bg-surface-warm": "#f8f9fc",
    "--bg-hover": "#eef1f6",
    "--bg-input": "#f8f9fc",
    "--text-primary": "#1a1d23",
    "--text-secondary": "#5f6b7a",
    "--text-muted": "#9ca3af",
    "--border-main": "#e2e5ea",
    "--border-light": "#eef0f4",
    "--accent": "#3b82f6",
    "--accent-dark": "#2563eb",
    "--accent-gold": "#f59e0b",
    "--accent-green": "#22c55e",
    "--accent-red": "#ef4444",
    "--sidebar-bg": "#ffffff",
    "--header-bg": "rgba(255,255,255,0.8)",
    "--gradient-from": "#3b82f6",
    "--gradient-to": "#2563eb",
  },
  dark: {
    name: "Dark",
    "--bg-primary": "#0f1117",
    "--bg-surface": "#1a1d27",
    "--bg-surface-warm": "#1e2130",
    "--bg-hover": "#252838",
    "--bg-input": "#1e2130",
    "--text-primary": "#e8e9ed",
    "--text-secondary": "#9ca0aa",
    "--text-muted": "#5c6170",
    "--border-main": "#2a2d3a",
    "--border-light": "#222530",
    "--accent": "#a78bfa",
    "--accent-dark": "#8b5cf6",
    "--accent-gold": "#fbbf24",
    "--accent-green": "#34d399",
    "--accent-red": "#f87171",
    "--sidebar-bg": "#13151d",
    "--header-bg": "rgba(26,29,39,0.85)",
    "--gradient-from": "#a78bfa",
    "--gradient-to": "#8b5cf6",
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("bizinsight-theme") || "beige";
  });

  useEffect(() => {
    localStorage.setItem("bizinsight-theme", theme);
    const vars = themes[theme];
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, value]) => {
      if (key.startsWith("--")) {
        root.style.setProperty(key, value);
      }
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
