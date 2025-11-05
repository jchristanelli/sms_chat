import Chat from '../models/chat.js';
import type { Message } from '../models/chat.js';

// Save message to chat and create chat if it does not exist
export async function saveMessage(message: Message): Promise<void> {
  const { phone } = message;
  let chat = await Chat.findOne({ phone });
  if (!chat) {
    chat = new Chat({ phone, messages: [] });
  }
  chat.messages.push(message);
  await chat.save();
}

// Retrieve all messages for a phone_number
export async function getMessages(phone: string) {
  const chat = await Chat.findOne({ phone });
  return chat?.messages || [];
}
