import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const client = twilio(accountSid, authToken);

/**
 * Send SMS message to a phone number via Twilio
 * @param to recipient phone number in E.164 format
 * @param from Twilio phone number in E.164 format
 * @param body message text
 */
export async function sendSms(to: string, from: string, body: string) {
  return await client.messages.create({ to, from, body });
}

/**
 * Validate and process incoming Twilio webhook SMS message
 * Replace or extend for your own business logic
 * @param data Webhook POST data from Twilio
 */
export function handleIncomingSms(data: any) {
  const from = data.From;
  const to = data.To;
  const body = data.Body;

  // Here, add or emit the received message in your app logic,
  // e.g., send to WebSocket clients or save to DB
  console.log('Received message from', from, ':', body);

  // Return TwiML response XML if needed or other response
  return `<Response><Message>Thanks for your message!</Message></Response>`;
}
