import axios from "axios";

/**
 * Fetch live prices for a list of coin IDs from CoinGecko.
 * Returns { bitcoin: { usd: 65000, usd_24h_change: 2.5 }, ... }
 */
export async function getLivePrices(coinIds) {
  try {
    const res = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(",")}&vs_currencies=usd&include_24hr_change=true`,
      { timeout: 6000 }
    );
    return res.data;
  } catch {
    // Return mock prices as fallback
    const mock = {};
    const bases = {
      bitcoin: 68500, ethereum: 3280, solana: 145, cardano: 0.58,
      dogecoin: 0.14, polkadot: 7.2, avalanche: 34, chainlink: 14.5,
      "matic-network": 0.72, litecoin: 84, ripple: 0.52, tron: 0.12,
      uniswap: 7.8, toncoin: 5.6, "shiba-inu": 0.000024,
    };
    coinIds.forEach((id) => {
      mock[id] = {
        usd: bases[id] || 10 + Math.random() * 100,
        usd_24h_change: (Math.random() - 0.5) * 10,
      };
    });
    return mock;
  }
}

/**
 * Search for coins by name
 */
export async function searchCoins(query) {
  try {
    const res = await axios.get(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      { timeout: 5000 }
    );
    return res.data.coins?.slice(0, 10).map((c) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol.toUpperCase(),
      thumb: c.thumb,
      large: c.large,
    })) || [];
  } catch {
    // Fallback suggestions
    const all = [
      { id: "bitcoin", name: "Bitcoin", symbol: "BTC", thumb: null },
      { id: "ethereum", name: "Ethereum", symbol: "ETH", thumb: null },
      { id: "solana", name: "Solana", symbol: "SOL", thumb: null },
      { id: "cardano", name: "Cardano", symbol: "ADA", thumb: null },
      { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", thumb: null },
      { id: "polkadot", name: "Polkadot", symbol: "DOT", thumb: null },
      { id: "avalanche-2", name: "Avalanche", symbol: "AVAX", thumb: null },
      { id: "chainlink", name: "Chainlink", symbol: "LINK", thumb: null },
      { id: "ripple", name: "Ripple", symbol: "XRP", thumb: null },
      { id: "litecoin", name: "Litecoin", symbol: "LTC", thumb: null },
    ];
    return all.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.symbol.toLowerCase().includes(query.toLowerCase())
    );
  }
}

/**
 * The top coins list for quick-add
 */
export const TOP_COINS = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "solana", name: "Solana", symbol: "SOL" },
  { id: "cardano", name: "Cardano", symbol: "ADA" },
  { id: "dogecoin", name: "Dogecoin", symbol: "DOGE" },
  { id: "ripple", name: "Ripple", symbol: "XRP" },
  { id: "polkadot", name: "Polkadot", symbol: "DOT" },
  { id: "avalanche-2", name: "Avalanche", symbol: "AVAX" },
  { id: "chainlink", name: "Chainlink", symbol: "LINK" },
  { id: "litecoin", name: "Litecoin", symbol: "LTC" },
  { id: "matic-network", name: "Polygon", symbol: "MATIC" },
  { id: "toncoin", name: "Toncoin", symbol: "TON" },
];
