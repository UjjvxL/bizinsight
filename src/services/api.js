import axios from "axios";

// ============================================================
// MOCK FALLBACK DATA
// Used when APIs are unavailable (rate-limits, CORS, offline)
// ============================================================

const mockProducts = [
  { id: 1, title: "Wireless Earbuds Pro", category: "electronics", price: 89.99, rating: { rate: 4.5 } },
  { id: 2, title: "Smart Watch Ultra", category: "electronics", price: 299.99, rating: { rate: 4.2 } },
  { id: 3, title: "Bluetooth Speaker", category: "electronics", price: 49.99, rating: { rate: 4.8 } },
  { id: 4, title: "4K Monitor 27\"", category: "electronics", price: 379.99, rating: { rate: 4.6 } },
  { id: 5, title: "Mechanical Keyboard", category: "electronics", price: 129.99, rating: { rate: 4.3 } },
  { id: 6, title: "Gold Chain Necklace", category: "jewelery", price: 695.00, rating: { rate: 4.1 } },
  { id: 7, title: "Silver Ring Set", category: "jewelery", price: 199.99, rating: { rate: 3.9 } },
  { id: 8, title: "Diamond Pendant", category: "jewelery", price: 999.99, rating: { rate: 4.7 } },
  { id: 9, title: "Pearl Bracelet", category: "jewelery", price: 349.99, rating: { rate: 4.4 } },
  { id: 10, title: "Slim Fit Shirt", category: "men's clothing", price: 44.99, rating: { rate: 4.0 } },
  { id: 11, title: "Denim Jacket", category: "men's clothing", price: 79.99, rating: { rate: 4.3 } },
  { id: 12, title: "Leather Belt", category: "men's clothing", price: 29.99, rating: { rate: 4.1 } },
  { id: 13, title: "Casual Sneakers", category: "men's clothing", price: 64.99, rating: { rate: 4.5 } },
  { id: 14, title: "Chino Pants", category: "men's clothing", price: 54.99, rating: { rate: 3.8 } },
  { id: 15, title: "Polo T-Shirt", category: "men's clothing", price: 34.99, rating: { rate: 4.2 } },
  { id: 16, title: "Floral Dress", category: "women's clothing", price: 59.99, rating: { rate: 4.6 } },
  { id: 17, title: "High-Waist Jeans", category: "women's clothing", price: 49.99, rating: { rate: 4.4 } },
  { id: 18, title: "Silk Blouse", category: "women's clothing", price: 89.99, rating: { rate: 4.3 } },
  { id: 19, title: "Winter Coat", category: "women's clothing", price: 129.99, rating: { rate: 4.7 } },
  { id: 20, title: "Yoga Leggings", category: "women's clothing", price: 39.99, rating: { rate: 4.5 } },
];

const generateMockCrypto = (days = 14) => {
  const data = [];
  let price = 62000;
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    price = price + Math.floor(Math.random() * 3000) - 1500;
    if (price < 55000) price = 55000 + Math.floor(Math.random() * 2000);
    data.push({
      timestamp: d.getTime(),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: Math.round(price),
    });
  }
  return data;
};

// ============================================================
// API FUNCTIONS
// ============================================================

// --- Fake Store API ---
const STORE_API = "https://fakestoreapi.com";

export const getProducts = async () => {
  try {
    const response = await axios.get(`${STORE_API}/products`, { timeout: 5000 });
    if (response.data && response.data.length > 0) {
      return response.data;
    }
    throw new Error("Empty response");
  } catch (error) {
    console.warn("⚠ Using fallback product data:", error.message);
    return mockProducts;
  }
};

// --- CoinGecko API ---
const COINGECKO_API = "https://api.coingecko.com/api/v3";

export const getCryptoPrices = async (days = 14) => {
  try {
    const response = await axios.get(
      `${COINGECKO_API}/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`,
      { timeout: 5000 }
    );

    if (!response.data || !response.data.prices) {
      throw new Error("Invalid response format");
    }

    const formattedData = response.data.prices.map((item) => {
      const date = new Date(item[0]);
      return {
        timestamp: item[0],
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        price: Math.round(item[1]),
      };
    });

    // Simplify: ~1 point per day
    const step = Math.max(1, Math.ceil(formattedData.length / days));
    return formattedData.filter(
      (_, index) => index % step === 0 || index === formattedData.length - 1
    );
  } catch (error) {
    console.warn("⚠ Using fallback crypto data:", error.message);
    return generateMockCrypto(days);
  }
};
