import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { saveMessage, type Message } from './models/chat.js'
import { sendMessageToTwilio } from './services/twilioService.js'
import { isDev } from './utils/env.js'
import { logger } from './utils/logger.js'
import { normalizeUSToE164 } from './utils/phone.js'

// TODO: Implement this on client side
type AckResponse = { ok: boolean; error?: any; message?: any }

type NewMessagePayload = {
  phoneNumber: string
  text: string
  tempId: string
}

type UpdatedMessagePayload = {
  message: Message
  tempId: string
}

let ioInstance: SocketIOServer | null = null
export function getSocketStats() {
  const sockets = ioInstance?.sockets?.sockets
  let numberOfSocketClients = -1

  if (sockets) {
    numberOfSocketClients = Object.keys(sockets).length
  }
  return { numberOfSocketClients }
}

export function broadcastNewMessage(messagePayload: Message) {
  if (!ioInstance) {
    logger.error('Socket IO not ready')
    return
  }
  ioInstance.emit('message:new', messagePayload)
}

export function setupSocket(server: HttpServer) {
  const io = new SocketIOServer(server)
  ioInstance = io

  io.on('connection', (socket) => {
    if (isDev()) {
      logger.log(`Client connected: ${socket.id}`)
      socket.onAny((event, ...args) => {
        logger.log(`[${socket.id}] Received event: ${event} with args: ${JSON.stringify(args, null, 2)}`)
      })
    }

    // Send welcome message on connect
    socket.emit('connect', {
      type: 'connect',
      message: 'Connected to sms-chat socket',
    })

    // Listening for incoming outgoing messages to be saved and broadcast
    socket.on(
      'message:send',
      async (data: NewMessagePayload, ack?: (res: AckResponse) => void) => {
        if (isDev()) logger.log(`[SOCKET IN] ${JSON.stringify(data)}`)

        const isAckFunction = typeof ack === 'function'

        if (
          !data ||
          typeof data.phoneNumber !== 'string' ||
          typeof data.text !== 'string' ||
          !data.text.trim()
        ) {
          const err = {
            code: 'VALIDATION',
            status: 400,
            message: 'Missing phoneNumber or text',
          }

          if (isAckFunction) {
            ack({ ok: false, error: err })
          }

          socket.emit('message:send:error', { error: err })
          return
        }

        const phoneNumber = normalizeUSToE164(data.phoneNumber)
        if (!phoneNumber) {
          const err = {
            code: 'INVALID_PHONE',
            status: 400,
            message: 'Phone number is not a valid US number',
          }
          if (isAckFunction) {
            ack({ ok: false, error: err })
          }
          socket.emit('message:send:error', { error: err })
          return
        }

        try {
          const text = data.text.trim()
          const sid = await sendMessageToTwilio(phoneNumber, text)

          if (!sid) {
            const errMsg = 'Failed to send message via Twilio'
            if (isAckFunction) {
              ack({
                ok: false,
                error: { message: errMsg },
              })
              return
            }
            logger.error(errMsg)
            socket.emit('message:sent:failed', data.tempId ?? '')
            return
          }

          const message: Message = {
            sid,
            isOutbound: true,
            phoneNumber,
            // status: data.status,
            text,
            timestamp: Date.now(),
          }

          await saveMessage(message)

          const messagePayload: UpdatedMessagePayload = {
            message,
            tempId: data.tempId ?? '',
          }

          // Send back with timestamp
          socket.emit('message:sent', messagePayload)
          socket.broadcast.emit('message:new', messagePayload)

          if (isDev())
            logger.log(
              `[SOCKET OUT] Broadcast message ${JSON.stringify(
                messagePayload,
              )}`,
            )
        } catch (err) {
          logger.error('Error processing sent message:', err)
          if (isAckFunction) {
            ack({ ok: false, error: { message: 'Internal server error' } })
            return
          }
          socket.emit('message:send:error', { error: { message: 'Internal server error' } });
        }
      },
    )

    // Handle client disconnects
    socket.on('disconnect', () => {
      if (isDev()) logger.log(`Client disconnected: ${socket.id}`)
    })

    // Handle socket errors
    socket.on('error', (error) => {
      logger.error('Socket.IO error:', error)
    })
  })
}
