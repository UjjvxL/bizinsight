/**
 * Google Sheets Integration — Fetch data from a published Google Sheet.
 * Users paste a published CSV URL and BizInsight auto-generates charts.
 *
 * How it works:
 * 1. User publishes their Google Sheet as CSV:
 *    File → Share → Publish to Web → CSV
 * 2. Paste the URL into BizInsight
 * 3. We fetch, parse, and chart it automatically
 */

import axios from "axios";

/**
 * Fetch and parse a published Google Sheet CSV.
 * Accepts either a Google Sheets published CSV URL or any public CSV URL.
 */
export async function fetchGoogleSheet(url) {
  try {
    // Transform Google Sheets URL to CSV export format if needed
    let csvUrl = url;
    if (url.includes("docs.google.com/spreadsheets")) {
      // Extract the spreadsheet ID
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
      }
    }

    const response = await axios.get(csvUrl, {
      timeout: 10000,
      responseType: "text",
    });

    return parseCSVText(response.data);
  } catch (error) {
    throw new Error(
      error.response?.status === 404
        ? "Sheet not found. Make sure it's published to the web."
        : "Failed to fetch sheet. Check the URL and make sure it's publicly accessible."
    );
  }
}

/**
 * Parse raw CSV text into structured data
 */
export function parseCSVText(text) {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) throw new Error("Sheet appears to be empty.");

  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      const val = values[i] || "";
      // Auto-detect number vs string
      const num = parseFloat(val.replace(/[,$%]/g, ""));
      obj[h] = !isNaN(num) && val.trim() !== "" ? num : val;
    });
    return obj;
  });

  // Identify column types for smart charting
  const columnTypes = {};
  headers.forEach((h) => {
    const sampleValues = rows.slice(0, 10).map((r) => r[h]);
    const numCount = sampleValues.filter((v) => typeof v === "number").length;
    columnTypes[h] = numCount > sampleValues.length / 2 ? "number" : "string";
  });

  return { headers, rows, columnTypes };
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Auto-suggest the best chart configuration from parsed data
 */
export function suggestChartConfig(data) {
  const { headers, columnTypes } = data;
  const numericCols = headers.filter((h) => columnTypes[h] === "number");
  const stringCols = headers.filter((h) => columnTypes[h] === "string");

  if (stringCols.length > 0 && numericCols.length > 0) {
    return {
      type: "bar",
      xAxis: stringCols[0],
      yAxis: numericCols[0],
      additionalAxes: numericCols.slice(1, 3), // Up to 2 more numeric columns
    };
  }

  if (numericCols.length >= 2) {
    return {
      type: "line",
      xAxis: numericCols[0],
      yAxis: numericCols[1],
      additionalAxes: numericCols.slice(2, 4),
    };
  }

  return { type: "table", xAxis: null, yAxis: null, additionalAxes: [] };
}
