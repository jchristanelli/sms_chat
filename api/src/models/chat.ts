import mongoose, { Schema } from 'mongoose'

// export enum MessageStatus {
//   Sending = 'SENDING',
//   Sent = 'SENT',
//   Delivered = 'DELIVERED',
//   Failed = 'FAILED',
// }

export interface Message {
  sid: string
  isOutbound: boolean
  phoneNumber: string
  text: string
  timestamp: number
  // status: MessageStatus
}

export interface Chat {
  phoneNumber: string
  messageCount: number
  lastMsgTimestamp: number
}

const MessageSchema = new Schema({
  sid: { type: String, required: true, unique: true },
  isOutbound: { type: Boolean, required: true },
  text: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  timestamp: { type: Number, required: true },
  // status: {
  //   type: String,
  //   enum: Object.values(MessageStatus),
  //   required: true,
  // },
})

const ChatSchema = new Schema({
  phoneNumber: { type: String, required: true, unique: true },
  msgCount: { type: Number, required: true, default: 0 },
  lastMsgTimestamp: { type: Number, required: true },
})

const MessageModel = mongoose.model<Message>('Messages', MessageSchema)
const ChatModel = mongoose.model<Chat>('Chat', ChatSchema)

export const saveMessage = async (message: Message) => {
  const { sid, phoneNumber } = message

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const existingMessage = await MessageModel.findOne({ sid })
      .session(session)
      .exec()
    if (existingMessage) {
      // Message exists, optionally update status here
      await session.commitTransaction()
      session.endSession()
      return
    }

    await MessageModel.create([message], { session })

    // Upsert chat document
    await ChatModel.findOneAndUpdate(
      { phoneNumber },
      {
        $inc: { msgCount: 1 },
        $max: { lastMsgTimestamp: message.timestamp },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, session },
    )

    await session.commitTransaction()
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

export const getMessages = async (phoneNumber: string) => {
  const messages = await MessageModel.find({ phoneNumber })
    .sort({ timestamp: 1 })
    .exec()
  return messages || []
}

export const getChats = () => {
  return ChatModel.find().sort({ lastMsgTimestamp: -1 }).exec()
}

// TODO: Allow multiple numbers to communicate with (but no way to check this)
// export const getChats = async () => {
//   // Example aggregate query returning message count per phone number
//   const result = await ChatModel.aggregate([
//     {
//       $project: {
//         phoneNumber: 1,
//         messageCount: { $size: '$messages' },
//       },
//     },
//   ])
//   return result || []
// }
