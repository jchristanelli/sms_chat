// utils/twilioStatus.ts
export type AppStatus = 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED'

export function mapTwilioStatusToAppStatus(twilioStatus?: string): AppStatus {
  if (!twilioStatus) return 'SENDING'
  const s = twilioStatus.toLowerCase().trim()

  switch (s) {
    case 'queued':
    case 'scheduled':
    case 'accepted':
    case 'sending':
      return 'SENDING'

    case 'sent':
      return 'SENT'

    case 'delivered':
      return 'DELIVERED'

    case 'undelivered':
    case 'failed':
      return 'FAILED'

    default:
      // conservative default; log upstream
      return 'SENDING'
  }
}
