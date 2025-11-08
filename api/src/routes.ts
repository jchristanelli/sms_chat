import cors from 'cors'
import express from 'express'
import {
  getChatsHandler,
  getMessagesHandler,
  incomingMessageWebhookHandler,
  receiveTestMessage,
  sendTestMessage,
} from './controllers/messageController.js'
import { generateFakeIncoming } from './controllers/messageGeneratorController.js'
import { health, healthUi } from './controllers/statsController.js'
import { twilioWebhookAuth } from './middleware/twilioWebhookAuth.js'
import type { IncomingMessage, ServerResponse } from 'http'


const rawBodySaver = (req: IncomingMessage, res: ServerResponse, buf: Buffer) => {
  if (buf && buf.length) {
    (req as IncomingMessage & { rawBody?: string}).rawBody = buf.toString('utf8');
  }
};

// We need to parse the raw body for this so we must bypass json parsing
const twilioRouter = express.Router()

twilioRouter.use(cors())
twilioRouter.post(
  '/messages/incoming',
  express.urlencoded({ extended: true, verify: rawBodySaver }),
  express.json({ verify: rawBodySaver }),
  twilioWebhookAuth,
  incomingMessageWebhookHandler,
)

const protectedRouter = express.Router()

// NOTE: Specifically choosing POSTs over GETs to maintain as private of phone numbers, even if we used UUIDs, bad actors could determine Bob is talking to the same 4 UUIDs aka people and construct social graphs
protectedRouter.post('/chat/list', getChatsHandler)
// Testing endpoints
protectedRouter.post(
  '/test/incoming-message/randomize',
  generateFakeIncoming,
)
protectedRouter.post('/test/outgoing-message', sendTestMessage)
protectedRouter.post('/test/outgoing-message', sendTestMessage)
protectedRouter.post('/test/incoming-message', receiveTestMessage)

const publicRouter = express.Router()

publicRouter.use(cors())
publicRouter.post('/chat/messages', getMessagesHandler)
publicRouter.get('/health', health) // json health
publicRouter.get('/health-ui', healthUi) // UI that polls /health every 5s
// router.post('/messages/status-update', twilioWebhookAuth, twilioStatusUpdate) // # TODO

export { protectedRouter, publicRouter, twilioRouter }

