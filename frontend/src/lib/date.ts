/**
 * Format string tanggal ISO (YYYY-MM-DD atau ISO 8601) ke tampilan lokal yang mudah dibaca.
 * @example formatDate("2023-05-15") => "May 15, 2023"
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "-"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}
