/**
 * AI Insights Engine — generates smart text insights from data patterns.
 * No external API needed — uses pure pattern analysis.
 */

export function generateInsights(cryptoData, productData, portfolio) {
  const insights = [];

  // Crypto trend insights
  if (cryptoData && cryptoData.length > 1) {
    const first = cryptoData[0].price;
    const last = cryptoData[cryptoData.length - 1].price;
    const change = ((last - first) / first * 100).toFixed(1);
    const direction = last > first ? "up" : "down";

    if (Math.abs(change) > 5) {
      insights.push({
        type: direction === "up" ? "positive" : "warning",
        title: `Bitcoin is ${direction} ${Math.abs(change)}% in 14 days`,
        detail: direction === "up"
          ? "Strong bullish momentum detected. Historical patterns suggest considering partial profit-taking if your portfolio is heavily weighted in BTC."
          : "Bearish pressure detected. This could be a buying opportunity if you believe in long-term fundamentals. Consider dollar-cost averaging.",
        category: "crypto",
      });
    }

    // Volatility check
    const prices = cryptoData.map((d) => d.price);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance) / avg * 100;

    if (volatility > 3) {
      insights.push({
        type: "info",
        title: `High market volatility detected (${volatility.toFixed(1)}%)`,
        detail: "Crypto market is showing above-average price swings. Consider setting tighter stop-losses or reducing position sizes during volatile periods.",
        category: "crypto",
      });
    }
  }

  // Portfolio insights
  if (portfolio && portfolio.length > 0) {
    const totalValue = portfolio.reduce((sum, h) => sum + (h.currentValue || 0), 0);
    const totalCost = portfolio.reduce((sum, h) => sum + (h.totalCost || 0), 0);

    if (totalValue > 0 && totalCost > 0) {
      const pnlPct = ((totalValue - totalCost) / totalCost * 100).toFixed(1);
      insights.push({
        type: totalValue > totalCost ? "positive" : "warning",
        title: `Portfolio is ${totalValue > totalCost ? "up" : "down"} ${Math.abs(pnlPct)}% overall`,
        detail: totalValue > totalCost
          ? `Your portfolio has grown from $${totalCost.toLocaleString()} to $${totalValue.toLocaleString()}. Consider rebalancing if any single coin exceeds 40% of total holdings.`
          : `Your portfolio is currently below your cost basis. If your investment thesis hasn't changed, this may be an opportunity to average down.`,
        category: "portfolio",
      });
    }

    // Concentration risk
    if (portfolio.length > 1) {
      const sorted = [...portfolio].sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0));
      const topPct = totalValue > 0 ? (sorted[0].currentValue / totalValue * 100) : 0;
      if (topPct > 60) {
        insights.push({
          type: "warning",
          title: `High concentration: ${sorted[0].symbol} is ${topPct.toFixed(0)}% of your portfolio`,
          detail: `Diversification reduces risk. Consider spreading across at least 3-5 assets. A sudden drop in ${sorted[0].symbol} could significantly impact your total portfolio.`,
          category: "portfolio",
        });
      }
    }
  }

  // Inventory insights
  if (productData && productData.length > 0) {
    const categories = productData.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
    const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);

    if (sorted.length > 0) {
      insights.push({
        type: "info",
        title: `"${sorted[0][0]}" is your largest category (${sorted[0][1]} items)`,
        detail: `Consider adding more variety to underperforming categories or increasing stock for high-demand items. Balanced inventory typically converts 15-20% better.`,
        category: "inventory",
      });
    }

    // Price analysis
    const avgPrice = productData.reduce((s, p) => s + p.price, 0) / productData.length;
    const expensive = productData.filter((p) => p.price > avgPrice * 2);
    if (expensive.length > 0) {
      insights.push({
        type: "info",
        title: `${expensive.length} premium products detected (>${(avgPrice * 2).toFixed(0)}$)`,
        detail: `High-value items like "${expensive[0].title}" drive margin but may need promotional support. Consider bundling or offering financing options.`,
        category: "inventory",
      });
    }
  }

  // Time-based insight
  const hour = new Date().getHours();
  if (hour < 10) {
    insights.push({
      type: "info",
      title: "Morning market briefing",
      detail: "Asian markets have been active overnight. Check your crypto positions for any significant moves that occurred while you were away.",
      category: "general",
    });
  }

  return insights;
}
