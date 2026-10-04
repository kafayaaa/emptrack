export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function formatTitle(slug: string): string {
  return safeDecode(slug)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function toSingular(word: string): string {
  const lower = word.toLowerCase()

  if (lower.endsWith("ies")) return word.slice(0, -3) + "y"

  if (/(ss|us|is)$/.test(lower)) return word
  if (lower.endsWith("s")) return word.slice(0, -1)

  return word
}
