import { v4 as uuidv4 } from 'uuid'
import { reactive, ref } from 'vue'

// TODO: Switch to SocketIO

interface Message {
  id: string
  sid?: string
  isOutbound: boolean
  text: string
  timestamp?: number
  // status: 'SENDING' | 'DELIVERED' | 'FAILED'
}

interface Chat {
  phoneNumber: string
  messages: Message[]
}

interface PayloadMessage extends Message {
  phoneNumber: string
}

export function useWebSocket (url: string) {
  const ws = new WebSocket(url)
  const chats = reactive<Chat[]>([])
  const selectedChat = ref<Chat | null>(null)

  ws.addEventListener('message', event => {
    const message: PayloadMessage = JSON.parse(event.data)

    let chat = chats.find(c => c.phoneNumber === message.phoneNumber)

    if (!chat) {
      chat = reactive({ phoneNumber: message.phoneNumber, messages: [] }) as Chat
      chats.push(chat)
    }
    chat.messages.push(message)
  })

  function selectChat (chat: Chat) {
    selectedChat.value = chat
  }

  function sendMessage (text: string) {
    if (!selectedChat.value) {
      return
    }

    const newMessage: PayloadMessage = {
      id: uuidv4(),
      isOutbound: true,
      phoneNumber: selectedChat.value.phoneNumber,
      // status: 'SENDING',
      text,
    }
    // Since frontend message always outbound, no isOutbound in payload, let server treat it as true

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(newMessage))
    } else {
      ws.addEventListener('open', () => ws.send(JSON.stringify(newMessage)), { once: true })
    }

    ws.send(JSON.stringify(newMessage))

    const { phoneNumber, ...message } = newMessage

    selectedChat.value.messages.push(message)
  }

  return { chats, selectedChat, selectChat, sendMessage }
}
