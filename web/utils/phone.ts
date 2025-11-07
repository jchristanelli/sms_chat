export function normalizeUSToE164 (raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') {
    return null
  }
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) {
    return `+1${digits}`
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  // allow already formatted E.164 like "+14155552671"
  if (digits.length === 11 && raw.trim().startsWith('+')) {
    return `+${digits}`
  }
  return null
}

export function isValidUSPhone (raw?: string | null): boolean {
  return normalizeUSToE164(raw) !== null
}

/**
 * Format E.164 (or plain 10/11-digit) into "XXX-XXX-XXXX" for display.
 */
export function e164ToUSDisplay (e164?: string): string {
  if (!e164) {
    return ''
  }

  const number = e164.slice(2)

  return `${number.slice(0, 3)}-${number.slice(3, 6)}-${number.slice(6)}`
}
