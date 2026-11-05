export const CSV_HEADER = [
  "Timestamp (UTC)",
  "Prize",
  "Full Name",
  "Email",
  "Company / Organization",
  "Marketing Consent"
].map(value => `"${value.replace(/"/g, '""')}"`).join(",");

export function csvCell(value) {
  let text = String(value ?? "");
  if (/^[\u0000-\u0020]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function serializeEntries(entries) {
  const rows = entries.map(entry => [
    entry.timestamp,
    entry.prize,
    entry.name,
    entry.email,
    entry.company,
    entry.marketingConsent ? "Yes" : "No"
  ].map(csvCell).join(","));
  return `\uFEFF${CSV_HEADER}\r\n${rows.join("\r\n")}${rows.length ? "\r\n" : ""}`;
}
