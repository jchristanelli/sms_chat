import type { Message } from '@/models/chat'
import { defineStore } from 'pinia'
import { findByAorB } from '@/utils/helpers'

interface ChatState {
  messages: Message[]
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [] as Message[],
    connected: false,
    loading: true,
    showConnectionStatus: false,
  }),

  getters: {
    messageCount: (state: ChatState) => state.messages.length,
    sortedMessages: (state: ChatState): Message[] => state.messages.toSorted((a, b) => a.timestamp - b.timestamp),
  },

  actions: {
    upsertMessage (newMessage: Message) {
      const index = findByAorB(this.messages, newMessage, 'sid', 'tempId')

      const existingMessageNotFound = index === -1
      if (existingMessageNotFound) {
        this.messages.push(newMessage)
      } else {
        this.messages.splice(index, 1, newMessage)
      }
    },
    setConnected (status: boolean) {
      this.connected = status
      this.showConnectionStatus = true
    },
    setLoading (status: boolean) {
      this.loading = status
    },
    clearMessages () {
      this.messages = []
    },
  },
})
