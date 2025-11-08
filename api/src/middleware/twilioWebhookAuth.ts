import type { NextFunction, Request, Response } from 'express'
import twilio from 'twilio'
import { getRequiredEnvVar } from '../utils/env.js'
import type { IncomingMessage, ServerResponse } from 'http';

type RequestWithRawBody = Request & { rawBody?: string };


export const twilioWebhookAuth = (
  req: RequestWithRawBody,
  res: Response,
  next: NextFunction
) => {
  const signature = req.headers['x-twilio-signature'] as string | undefined;
  const url = 'https://sms-chat.instatunnel.my/api/messages/incoming';

  const isFormEncoded = req.is('application/x-www-form-urlencoded');

  const params = isFormEncoded ? req.body : req.rawBody ?? '';

  // Use the rawBody string captured earlier for validation
  const valid = twilio.validateRequest(
    getRequiredEnvVar('TWILIO_AUTH_TOKEN'),
    signature || '',
    url,
    params as any
  );

  if (!valid) {
    return res.status(403).send('Invalid Twilio signature');
  }

  next();
};