/**
 * Converts an array of objects to a CSV string.
 */
export function jsonToCsv(data: any[]): string {
  if (!data || !data.length) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","), // Header row
    ...data.map(row =>
      headers.map(fieldName => {
        const value = row[fieldName];
        // Handle values that might contain commas, quotes, or newlines
        const escaped = ('' + (value ?? '')).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(",")
    )
  ];

  return csvRows.join("\r\n");
}

/**
 * Triggers a browser download of a CSV file.
 */
export function downloadCsv(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
