import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const transactions = [
  { id: "TXN-001", product: "Smart Watch Ultra", category: "Electronics", amount: 299.99, status: "Completed", type: "sale" },
  { id: "TXN-002", product: "Gold Chain Necklace", category: "Jewelery", amount: 695.00, status: "Pending", type: "sale" },
  { id: "TXN-003", product: "Denim Jacket", category: "Men's Clothing", amount: 79.99, status: "Completed", type: "sale" },
  { id: "TXN-004", product: "Yoga Leggings", category: "Women's Clothing", amount: 39.99, status: "Completed", type: "sale" },
  { id: "TXN-005", product: "BTC Purchase", category: "Crypto", amount: 1250.00, status: "Completed", type: "purchase" },
];

export default function RecentTransactions() {
  return (
    <div className="rounded-2xl shadow-sm border transition-colors duration-300" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
      <div className="p-6 pb-0 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Recent Transactions</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Latest activity across all channels</p>
        </div>
        <button className="text-xs font-medium transition-colors" style={{ color: "var(--accent)" }}>View All →</button>
      </div>
      <div className="overflow-x-auto mt-4">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
              {["Transaction", "Category", "Amount", "Status"].map((h) => (
                <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider px-6 py-3" style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr key={idx} className="transition-colors cursor-pointer"
                style={{ borderBottom: idx < transactions.length - 1 ? "1px solid var(--border-light)" : "none" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: tx.type === "sale" ? "rgba(91,154,111,0.1)" : "rgba(199,92,92,0.1)" }}>
                      {tx.type === "sale" ? <ArrowUpRight className="w-4 h-4" style={{ color: "var(--accent-green)" }} /> : <ArrowDownRight className="w-4 h-4" style={{ color: "var(--accent-red)" }} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{tx.product}</p>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{tx.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3.5"><span className="text-xs" style={{ color: "var(--text-secondary)" }}>{tx.category}</span></td>
                <td className="px-6 py-3.5">
                  <span className="text-sm font-semibold" style={{ color: tx.type === "sale" ? "var(--accent-green)" : "var(--accent-red)" }}>
                    {tx.type === "sale" ? "+" : "-"}${tx.amount.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{
                      color: tx.status === "Completed" ? "var(--accent-green)" : "var(--accent-gold)",
                      backgroundColor: tx.status === "Completed" ? "rgba(91,154,111,0.1)" : "rgba(201,169,110,0.15)",
                    }}>{tx.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
