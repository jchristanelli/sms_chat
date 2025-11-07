import type { NextFunction, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import {
  getChats,
  getMessages,
  saveMessage,
  type Message,
} from '../models/chat.js'
import { incrementIncomingMessageCount } from '../services/twilioService.js'
import { logger } from '../utils/logger.js'
import { normalizeUSToE164 } from '../utils/phone.js'
import { broadcastNewMessage } from '../websocket.js'

// Testing Purposes
export async function sendTestMessage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { phoneNumber, text } = req.body

    if (!phoneNumber || !text) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: phoneNumber or text' })
    }

    const validPhoneNumber = normalizeUSToE164(phoneNumber)
    if (!validPhoneNumber) {
      return res.status(400).json({ error: 'Invalid phone number format' })
    }

    await saveMessage({
      sid: `FAKE-${uuidv4()}`,
      isOutbound: true,
      phoneNumber: validPhoneNumber,
      text,
      timestamp: Date.now(),
    })

    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json('Failed to send message')
  }
}

// Testing purposes
export async function receiveTestMessage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.body.sid = `FAKE-${uuidv4()}`
  return incomingMessageWebhookHandler(req, res, next)
}

// Twilio webhook for incoming SMS messages
export async function incomingMessageWebhookHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const phoneNumberRaw = String(req.body.From || req.body.from || '').trim()
    const text = String(req.body.Body || req.body.body || '').trim()
    const sid = String(req.body.MessageSid || req.body.messageSid || '').trim()

    if (!phoneNumberRaw) {
      logger.error('Twilio webhook - Missing phone number in request')
      return res.status(400).send('Missing phone number')
    }

    const phoneNumber = normalizeUSToE164(phoneNumberRaw)
    if (!phoneNumber) {
      logger.error(
        `Twilio webhook - Phone number is invalid or unsupported: ${phoneNumberRaw}`,
      )
      return res.status(400).send('Invalid phone number')
    }

    incrementIncomingMessageCount()

    const message: Message = {
      sid,
      phoneNumber,
      isOutbound: false,
      text,
      timestamp: Date.now(),
    }

    try {
      await saveMessage(message)
    } catch (err) {
      logger.error('Failed to save incoming message', err)
      return res.status(500).json('Webhook processing error')
      // optionally continue since saving failure may not block webhook response
    }

    try {
      broadcastNewMessage(message)
    } catch (err) {
      logger.error('Failed to broadcast new message', err)
      // optionally continue to respond to Twilio
    }

    res.type('text/xml').send('<Response></Response>') // Empty TwiML response
  } catch (error) {
    res.status(500).json('Webhook processing error')
  }
}

// Get chat messages by phone number
export async function getMessagesHandler(req: Request, res: Response) {
  try {
    const phoneNumber = req.params.phone
    if (!phoneNumber) {
      return res.status(400).json('Missing phone number')
    }
    const messages = await getMessages(phoneNumber)
    res.json(messages)
  } catch (error) {
    res.status(500).json('Failed to fetch messages')
  }
}

export async function getChatsHandler(req: Request, res: Response) {
  try {
    const chats = await getChats()
    res.json(chats)
  } catch (error) {
    console.error('Failed to get conversations:', error);
    res.status(500).json('Failed to get cconversations')
  }
}

// TODO: Remove (from using ws package)
// let longPollingClients: Response[] = []

// export async function longPoll(req: Request, res: Response) {
//   longPollingClients.push(res)
//   setTimeout(() => {
//     const index = longPollingClients.indexOf(res)
//     if (index !== -1) {
//       longPollingClients.splice(index, 1)
//       res.json({ messages: [] }) // Empty response if timeout
//     }
//   }, Number(process.env.LONG_POLL_SECS || 10) * 1000)
// }
