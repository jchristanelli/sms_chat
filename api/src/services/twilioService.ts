import { twilioClient, twilioPhoneNumber } from '../config/twilio.js'
import { logger } from '../utils/logger.js'

const messageCounts = {
  incoming: 0,
  incomingErrors: 0,
  outgoing: 0,
  outgoingErrors: 0,
}

export async function incrementIncomingMessageCount(isSuccess = true) {
  if (isSuccess) {
    messageCounts.incoming += 1
  } else {
    messageCounts.incomingErrors += 1
  }
}

export function getTwilioMessageCount() {
  return { ...messageCounts }
}

export async function sendMessageToTwilio(phoneNumber: string, text: string) {
  try {
    const twResp = await twilioClient.messages.create({
      to: phoneNumber,
      from: twilioPhoneNumber,
      body: text,
    })

    messageCounts.outgoing++

    return twResp.sid
  } catch (error) {
    messageCounts.outgoingErrors++
    logger.error('Failed to send twilio message', error)
    return null
  }
}
