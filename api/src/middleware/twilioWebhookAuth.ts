import type { NextFunction, Request, Response } from 'express'
import twilio from 'twilio'
import { getRequiredEnvVar } from '../utils/env.js'

export const twilioWebhookAuth = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['x-twilio-signature'] as string | undefined
  const url = process.env.TWILIO_WEBHOOK_URL as string
  const params = req.body

  const valid = twilio.validateRequest(
    getRequiredEnvVar('TWILIO_AUTH_TOKEN'),
    signature || '',
    url,
    params,
  )

  if (!valid) return res.status(403).send('Invalid Twilio signature')

  next()
}
