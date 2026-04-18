/**
 * Currency Context — Multi-currency support with auto-detection.
 * Converts all prices between USD, EUR, GBP, INR, JPY.
 */
import { createContext, useContext, useState, useEffect } from "react";
import storage from "../services/storage";

const CurrencyContext = createContext(null);

// Approximate exchange rates (updated periodically via API or hardcoded fallback)
const FALLBACK_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  JPY: 154.5,
  AUD: 1.53,
  CAD: 1.37,
};

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
};

const CURRENCY_NAMES = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  INR: "Indian Rupee",
  JPY: "Japanese Yen",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
};

function detectCurrency() {
  try {
    const locale = navigator.language || "en-US";
    const map = {
      "en-US": "USD", "en-GB": "GBP", "en-AU": "AUD", "en-CA": "CAD",
      "hi-IN": "INR", "en-IN": "INR", "ja-JP": "JPY",
      "de-DE": "EUR", "fr-FR": "EUR", "es-ES": "EUR", "it-IT": "EUR",
    };
    return map[locale] || "USD";
  } catch {
    return "USD";
  }
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => storage.get("user_currency", detectCurrency()));
  const [rates, setRates] = useState(FALLBACK_RATES);

  useEffect(() => { storage.set("user_currency", currency); }, [currency]);

  // Try to fetch live rates
  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        if (data.rates) {
          setRates((prev) => ({
            ...prev,
            EUR: data.rates.EUR || prev.EUR,
            GBP: data.rates.GBP || prev.GBP,
            INR: data.rates.INR || prev.INR,
            JPY: data.rates.JPY || prev.JPY,
            AUD: data.rates.AUD || prev.AUD,
            CAD: data.rates.CAD || prev.CAD,
          }));
        }
      } catch { /* use fallback rates */ }
    }
    fetchRates();
  }, []);

  const convert = (amountUSD) => {
    const rate = rates[currency] || 1;
    return amountUSD * rate;
  };

  const format = (amountUSD, options = {}) => {
    const converted = convert(amountUSD);
    const { compact, decimals } = options;

    if (compact && converted >= 1000) {
      const suffix = converted >= 1_000_000 ? "M" : "K";
      const divisor = converted >= 1_000_000 ? 1_000_000 : 1000;
      return `${CURRENCY_SYMBOLS[currency]}${(converted / divisor).toFixed(1)}${suffix}`;
    }

    const maxDecimals = decimals !== undefined ? decimals : (currency === "JPY" ? 0 : converted < 1 ? 6 : 2);
    return `${CURRENCY_SYMBOLS[currency]}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: maxDecimals })}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency, setCurrency, convert, format, rates,
      symbol: CURRENCY_SYMBOLS[currency],
      currencies: Object.keys(CURRENCY_SYMBOLS).map((c) => ({ code: c, name: CURRENCY_NAMES[c], symbol: CURRENCY_SYMBOLS[c] })),
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
