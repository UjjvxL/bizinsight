import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Export dashboard data as CSV and trigger download
 */
export function exportCSV(products, cryptoData) {
  const rows = [["Section", "Name", "Category", "Value", "Date"]];

  // Add product rows
  products.forEach((p) => {
    rows.push(["Inventory", p.title, p.category, `$${p.price}`, "-"]);
  });

  // Add crypto rows
  cryptoData.forEach((c) => {
    rows.push(["Bitcoin Price", "BTC", "Cryptocurrency", `$${c.price.toLocaleString()}`, c.date]);
  });

  const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `BizInsight_Report_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export dashboard data as PDF and trigger download
 */
export function exportPDF(products, cryptoData, kpiData) {
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  // Title
  doc.setFontSize(22);
  doc.setTextColor(45, 42, 38);
  doc.text("BizInsight Analytics Report", 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(125, 116, 105);
  doc.text(`Generated on ${now}`, 14, 30);

  // Line separator
  doc.setDrawColor(232, 226, 217);
  doc.line(14, 34, 196, 34);

  // KPI Summary
  doc.setFontSize(14);
  doc.setTextColor(45, 42, 38);
  doc.text("Key Metrics", 14, 44);

  doc.setFontSize(10);
  doc.setTextColor(93, 85, 73);
  const kpiY = 52;
  if (kpiData.btcPrice) {
    doc.text(`Bitcoin Price: $${kpiData.btcPrice.toLocaleString()}`, 14, kpiY);
  }
  if (kpiData.totalProducts) {
    doc.text(`Total Products: ${kpiData.totalProducts}`, 14, kpiY + 7);
  }
  if (kpiData.avgPrice) {
    doc.text(`Average Product Value: $${kpiData.avgPrice.toFixed(2)}`, 14, kpiY + 14);
  }

  // Product Table
  doc.setFontSize(14);
  doc.setTextColor(45, 42, 38);
  doc.text("Inventory Overview", 14, kpiY + 28);

  const tableData = products.map((p) => [
    p.title?.substring(0, 35) || "—",
    p.category || "—",
    `$${p.price}`,
    p.rating?.rate?.toString() || "—",
  ]);

  autoTable(doc, {
    startY: kpiY + 33,
    head: [["Product", "Category", "Price", "Rating"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [138, 122, 107], textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [45, 42, 38] },
    alternateRowStyles: { fillColor: [249, 246, 241] },
    margin: { left: 14, right: 14 },
  });

  // Bitcoin Price Table
  const finalY = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.setTextColor(45, 42, 38);
  doc.text("Bitcoin Price History", 14, finalY);

  const cryptoTableData = cryptoData.map((c) => [
    c.date,
    `$${c.price.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: finalY + 5,
    head: [["Date", "Price (USD)"]],
    body: cryptoTableData,
    theme: "grid",
    headStyles: { fillColor: [138, 122, 107], textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [45, 42, 38] },
    alternateRowStyles: { fillColor: [249, 246, 241] },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(181, 168, 152);
    doc.text(`BizInsight © ${new Date().getFullYear()} — Page ${i} of ${pageCount}`, 14, 287);
  }

  doc.save(`BizInsight_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
