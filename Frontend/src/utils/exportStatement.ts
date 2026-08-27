// src/utils/exportStatement.ts

interface CsvExportOptions {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Generates and triggers a browser download for a structured CSV file
 */
export function exportToCSV({ filename, headers, rows }: CsvExportOptions): void {
  const csvRows: string[] = [];

  // Add Header Row
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","));

  // Add Data Rows
  for (const row of rows) {
    const formattedRow = row.map((val) => {
      const stringVal = val === null || val === undefined ? "" : String(val);
      return `"${stringVal.replace(/"/g, '""')}"`;
    });
    csvRows.push(formattedRow.join(","));
  }

  // Create Blob & Trigger Download
  const csvContent = "\uFEFF" + csvRows.join("\n"); // UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}