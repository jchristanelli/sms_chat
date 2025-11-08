import mongoose from 'mongoose'
import { logger } from '../utils/logger.js'

const MONGO_URI =
  (process.env.MONGO_URI || 'mongodb://localhost:27017/sms_chat_db') + 
  '?replicaSet=rs0'

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI)

    logger.log('MongoDB connected')
  } catch (err) {
    logger.error('MongoDB connection error:', err)

    process.exit(1)
  }
}

export async function disconnectDB() {
  const connectionOpen = mongoose.connection && mongoose.connection.readyState
  if (connectionOpen) {
    // false = don't force closing sockets immediately
    await mongoose.connection.close(false)
    console.log('[db] connection closed')
  } else {
    console.log('[db] connection not open, nothing to close')
  }
}

export function getDbState() {
  const MongooseReadyState = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized',
  } as const

  const dbState = mongoose.connection?.readyState ?? 0

  return MongooseReadyState[dbState]
}
