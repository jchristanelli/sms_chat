import 'dotenv/config'
import http from 'http'
import app from './app.js'
import { connectDB } from './config/db.js'
import { logger } from './utils/logger.js'
import { setupSocket } from './websocket.js'

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.stack || err)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Uncaught Exception:', reason)
  console.error('Unhandled Rejection:', reason, promise)
})

const PORT = Number(process.env.PORT || 8080)

async function start() {
  try {
    await connectDB()
    const server = http.createServer(app)
    setupSocket(server)

    server.listen(PORT, () => {
      logger.log?.(`Server listening on ${PORT}`)
    })
  } catch (err) {
    logger.error('Startup error', err)
    process.exit(1)
  }
}

start()
