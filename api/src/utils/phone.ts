export function normalizeUSToE164(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null
  const digits = raw.replace(/\D/g, '')

  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`

  return null
}

export function isValidUSPhone(raw: string): boolean {
  return normalizeUSToE164(raw) !== null
}