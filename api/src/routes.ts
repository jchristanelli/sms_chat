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

const protectedRouter = express.Router()

// NOTE: Specifically choosing POSTs over GETs to maintain as private of phone numbers, even if we used UUIDs, bad actors could determine Bob is talking to the same 4 UUIDs aka people and construct social graphs
protectedRouter.post('/chat/list', getChatsHandler)
// Testing endpoints
protectedRouter.post(
  '/test/incoming-message/randomize',
  generateFakeIncoming,
)
protectedRouter.post('/test/outgoing-message', sendTestMessage)
protectedRouter.post('/test/incoming-message', receiveTestMessage)

const publicRouter = express.Router()

publicRouter.use(cors())
publicRouter.post('/chat/messages', getMessagesHandler)
publicRouter.get('/health', health) // json health
publicRouter.get('/health-ui', healthUi) // UI that polls /health every 5s
publicRouter.post(
  '/messages/incoming',
  twilioWebhookAuth,
  incomingMessageWebhookHandler,
)
// router.post('/messages/status-update', twilioWebhookAuth, twilioStatusUpdate) // # TODO

export { protectedRouter, publicRouter }

