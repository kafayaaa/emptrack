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

/**
 * Memvalidasi apakah string tanggal bertipe YYYY-MM-DD merupakan tanggal kalender yang sah.
 * Mencegah perilaku JavaScript Date rollover bawaan (misal "2024-02-31" otomatis berubah menjadi 2 Maret).
 * @example isValidCalendarDate("2024-02-29") => true (kabisat)
 * @example isValidCalendarDate("2024-02-31") => false
 */
export function isValidCalendarDate(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false
  const [yearStr, monthStr, dayStr] = dateString.split("-")
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)
  const day = parseInt(dayStr, 10)

  if (month < 1 || month > 12 || day < 1 || day > 31) return false

  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}
