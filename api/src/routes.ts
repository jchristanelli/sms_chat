import express from 'express';
import { sendSms, handleIncomingSms } from './services/twilio.js';
import { saveMessage, getMessages } from './services/chat.js';

import { getErrorMessage } from './lib/lib.js';
import type { Message } from './models/chat.js';

const router = express.Router();

// POST endpoint Twilio calls on SMS receive (Webhook)
router.post('/twilio/sms', express.urlencoded({ extended: true }), (req, res) => {
  const twiml = handleIncomingSms(req.body);
  res.type('text/xml').send(twiml);
});

// Example API to send SMS message
router.post('/twilio/send', express.json(), async (req, res) => {
  try {
    const { to, from, body } = req.body;
    const message = await sendSms(to, from, body);
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) });
  }
});



export default router;
