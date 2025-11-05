import mongoose, { Document, Schema } from 'mongoose';

export interface Message {
  phone: string;      // phone number associated with chat
  from: string;       // sender
  text: string;       // message text
  timestamp: number;  // Unix timestamp (ms)
}

export interface ChatSession  extends Document {
  phone: string;       // unique identifier (user phone)
  messages: Message[];
}

const MessageSchema = new Schema<Message>({
  phone: { type: String, required: true },
  from: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Number, required: true },
});

const ChatSessionSchema = new Schema<ChatSession>({
  phone: { type: String, required: true, unique: true },
  messages: { type: [MessageSchema], default: [] }
});

const ChatSessionModel = mongoose.model<ChatSession>('Chat', ChatSessionSchema);
export default ChatSessionModel;
