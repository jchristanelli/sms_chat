import express from 'express'
import http from 'http'
import { WebSocket, WebSocketServer } from 'ws'
import { connectDB } from './config/db.js'
import './config/dotenv.js'
import routes from './routes.js'
import type { Message } from './models/chat.js'

const PORT = process.env.PORT || 3000
const LONG_POLLING_TIMEOUT = 10000

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ noServer: true })

app.use(express.json())

// In-memory, long polling clients
let longPollingClients: express.Response[] = []

// Long Poll endpoint
app.get('/poll', (req, res) => {
  longPollingClients.push(res)

  // Timeout to avoid hanging requests
  setTimeout(() => {
    const index = longPollingClients.indexOf(res)
    if (index !== -1) {
      longPollingClients.splice(index, 1)
      res.json({ messages: [] })
    }
  }, LONG_POLLING_TIMEOUT)
})

app.use('/api', routes)

// Websockets
wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (message) => {
    // Broadcast message to all other ws clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })

    // Also send message to long-polling clients then clear them
    try {
      const parsedMsg = JSON.parse(message.toString()) as Message
      longPollingClients.forEach((res) => res.json({ messages: [parsedMsg] }))
    } catch {
      longPollingClients.forEach((res) => res.json({ messages: [] }))
    }
    longPollingClients = []
  })
})

// Fallback HTTP POST to simulate message sending for fallback
app.post('/api/send-message', (req, res) => {
  const msg: Message = req.body;
  // TODO: save in db and broadcast via ws
  console.log('Received fallback message:', msg);
  res.status(200).json({ success: true });
});

// HTTP upgrade for WebSocket
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket as any, head, (ws) => {
    wss.emit('connection', ws, request)
  })
})

const startServer = async () => {
  await connectDB()

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}


startServer()
