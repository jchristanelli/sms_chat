import type { NextFunction, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { saveMessage } from '../models/chat.js'
import { normalizeUSToE164 } from '../utils/phone.js'
import { isDev } from '../utils/env.js'

const FAKE_NUMBERS = ['+10000000000', '+13333333333']
const SAMPLE_PHRASES = [
  'Hey, are you there?',
  'Call me when free',
  "What's up?",
  'Quick question about the meeting',
  'This is a test message',
  'Running late, be there soon',
  'On my way',
  'Running 5 minutes late',
  'Can you call me?',
  'Where are you?',
  'Got the files, thanks',
  'Confirming appointment tomorrow at 10am',
  'Call me ASAP',
  'Is this the right number?',
  'Please resend the link',
  'Happy birthday!',
  'Meeting moved to 2pm',
  "I'm stuck in traffic",
  'Send the invoice when you can',
  'Thanks for the help',
  'Who is this?',
  'See you soon',
  'Do you have a minute?',
  'Please cancel my order',
  'Package arrived. Coming to pick it up',
  'Can we reschedule for next week?',
]

export async function generateFakeIncoming(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!isDev()) {
      return res.status(403).json({ ok: false, error: 'dev-only' })
    }

    // Pick phone and random phrase
    const rawPhone = Math.random() < 0.5 ? FAKE_NUMBERS[0] : FAKE_NUMBERS[1]
    const text = SAMPLE_PHRASES[
      Math.floor(Math.random() * SAMPLE_PHRASES.length)
    ] as string

    // Easier to find and delete later
    const sid = `FAKE-${uuidv4()}` // fake Twilio MessageSid
    const id = `FAKE-uuidv4()` // local id
    const phoneNumber = normalizeUSToE164(rawPhone as string) as string

    await saveMessage({
      sid,
      phoneNumber,
      isOutbound: false,
      text,
      timestamp: Date.now(),
    })

    return res.status(200).json({
      ok: true,
      message: { id, sid, phoneNumber, text },
    })
  } catch (err) {
    return next(err)
  }
}
