import twilio from 'twilio'
import { getRequiredEnvVar } from '../utils/env.js'

const accountSid = getRequiredEnvVar('TWILIO_ACCOUNT_SID')
const authToken = getRequiredEnvVar('TWILIO_AUTH_TOKEN')
const twilioPhoneNumber = getRequiredEnvVar('TWILIO_PHONE_NUMBER')

const twilioClient = twilio(accountSid, authToken)

function _envTrim(name: string): string {
  return (process.env[name] || '').trim()
}

export function isTwilioReady(): boolean {
  const sid = _envTrim('TWILIO_ACCOUNT_SID')
  const token = _envTrim('TWILIO_AUTH_TOKEN')
  const from = _envTrim('TWILIO_PHONE_NUMBER')
  const msid = _envTrim('TWILIO_MESSAGING_SERVICE_SID')

  if (!sid || !token) return false
  if (!from && !msid) return false
  return true
}

export { twilioClient, twilioPhoneNumber }
