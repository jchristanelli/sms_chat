<template>
  <v-app>
    <v-container class="fill-height pa-0" fluid>
      <v-row class="fill-height" no-gutters>
        <v-col>
          <v-card class="d-flex flex-column fill-height" elevation="0">
            <!-- Header -->
            <v-card-title class="bg-primary">
              <span class="text-h6">Chat</span>
            </v-card-title>

            <!-- Messages Area -->
            <v-card-text
              ref="messagesContainer"
              class="flex-grow-1 overflow-y-auto pa-4"
              style="flex-grow: 1; min-height: 0;"
            >
              <div v-if="loading" class="text-center">
                <v-progress-circular color="primary" indeterminate />
              </div>

              <div v-else>
                <MessageItem
                  v-for="message in sortedMessages"
                  :key="messageKey(message)"
                  :message="message"
                />
              </div>
            </v-card-text>

            <!-- Input Area -->
            <v-card-actions class="pa-4 border-t">
              <MessageInput :disabled="!connected" @send="sendMessage" />
            </v-card-actions>

            <!-- Info Bar -->
            <v-card-actions
              class="px-4 py-1 border-t d-flex justify-space-between"
              style="position: sticky; bottom: 0; z-index: 999;"
            >
              <div class="d-flex align-center">
                <v-icon
                  class="mr-2"
                  :color="connected ? 'green' : 'red'"
                  size="16"
                >mdi-circle</v-icon>
                <span>{{ connected ? 'Connected' : 'Disconnected' }}</span>
              </div>
              <div class="d-flex align-center">
                <v-icon class="mr-1" size="16">mdi-message-text</v-icon>
                <span>{{ messageCount }} messages</span>
              </div>
              <div class="d-flex align-center">
                <v-icon class="mr-1" size="16">mdi-wifi</v-icon>
                <span>{{ transportType }}</span>
              </div>
            </v-card-actions>

            <!-- Connection Status Popup -->
            <v-snackbar
              v-model="showConnectionStatus"
              :color="connected ? 'success' : 'error'"
              location="top"
              :timeout="popupDurationMs"
            >
              {{ connected ? 'Connected' : 'Disconnected from server' }}
            </v-snackbar>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
  import type { Message } from '@/models/chat'
  import { v4 as uuidv4 } from 'uuid'
  import { computed, nextTick, onMounted, onUnmounted, ref, watchEffect } from 'vue'
  import MessageInput from '@/components/MessageInput.vue'
  import MessageItem from '@/components/MessageItem.vue'
  import { socketService } from '@/services/socketService'

  import { useChatStore } from '@/stores/chatStore'

  const chatStore = useChatStore()
  const showConnectionStatus = ref(false)
  const messagesContainer = ref<HTMLElement | null>(null)
  const popupDurationMs = 3000

  const apiUrl = import.meta.env.VITE_API_URL
  const testPhoneNumber = import.meta.env.VITE_TEST_PHONE

  const socket = socketService.connect(apiUrl)

  // Reactive connection and transport info
  const connected = ref(socketService.connected)
  const transportType = ref('unknown')

  // Reactive computed properties
  const loading = computed(() => chatStore.loading)
  const messageCount = computed(() => chatStore.messages.length)
  const sortedMessages = computed(() => chatStore.sortedMessages)

  // Get initial transport type
  if (socket.io?.engine?.transport?.name) {
    transportType.value = socket.io.engine.transport.name
  }

  // Update transportType reactively
  watchEffect(() => {
    if (socket.io?.engine?.transport?.name) {
      transportType.value = socket.io.engine.transport.name
    }
  })

  // Provide a unique and stable key for v-for messages
  function messageKey (message: Message): string {
    return message.sid ? `sid_${message.sid}` : `ts_${message.timestamp}`
  }

  // Scroll to the latest message
  function scrollToBottom () {
    nextTick(() => {
      if (!messagesContainer.value) return
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    })
  }

  // Send message with optimistic local update
  function sendMessage (text: string) {
    if (!socketService || !connected.value) {
      console.error('Socket not connected')
      return
    }

    const message: Message = {
      text,
      tempId: uuidv4(),
      phoneNumber: testPhoneNumber, // TODO Allow specifying a number
      isOutbound: true, // Server will override this as source of truth
      timestamp: Date.now(), // Server will override this as source of truth
    }

    socketService.emit('message:send', message)
    // Optimistic update of message locally
    chatStore.upsertMessage(message)

    scrollToBottom()
  }

  async function loadMessageHistory () {
    chatStore.setLoading(true)
    try {
      console.log('full url', `${apiUrl}/api/chat/messages`)
      const response = await fetch(`${apiUrl}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: testPhoneNumber }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const messages: Message[] = await response.json()
      for (const msg of messages) {
        chatStore.upsertMessage(msg)
      }
      scrollToBottom()
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      chatStore.setLoading(false)
    }
  }

  // Setup socket event listeners on mount
  onMounted(() => {
    loadMessageHistory()

    socketService.on('connect', () => {
      chatStore.setConnected(true)
      connected.value = true
      transportType.value = socketService['socket']?.io.engine.transport.name || 'unknown'
      showConnectionStatus.value = true
      console.log('Socket connected')
    })

    socketService.on('disconnect', () => {
      chatStore.setConnected(false)
      connected.value = false
      transportType.value = 'disconnected'
      showConnectionStatus.value = true
      console.log('Socket disconnected')
    })

    socketService.on('message:new', (msg: Message) => {
      chatStore.upsertMessage(msg)
      scrollToBottom()
    })

    socketService.on('message:sent', (msgPayload: Message & { tempId: string }) => {
      console.log('msgPayload', msgPayload)
      chatStore.upsertMessage(msgPayload)
      scrollToBottom()
    })

    socketService.on('message:send:error', err => {
      console.error('Message send error:', err)
    })

    socketService.on('error', err => {
      console.error('Socket error:', err)
    })

    socketService['socket']?.io.engine.on('upgrade', () => {
      transportType.value = socketService['socket']?.io.engine.transport.name || 'unknown'
      console.log('Transport upgraded to', transportType.value)
    })
  })

  onUnmounted(() => {
    socketService.off('connect')
    socketService.off('disconnect')
    socketService.off('message:new')
    socketService.off('message:sent')
    socketService.off('message:send:error')
    socketService.off('error')
    socketService['socket']?.io.engine.off('upgrade')

    socketService.disconnect()
  })
</script>

<style scoped>
.border-t {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.v-theme--dark .border-t {
  border-top-color: rgba(255, 255, 255, 0.12);
}

.v-application {
  background-color: #e6e8ea; /* Matte light gray background */
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.message-outbound {
  justify-content: flex-end;
}

.message-inbound {
  justify-content: flex-start;
}

/* White rounded bubbles with slight shadow */
.message-card {
  background-color: rgba(255, 255, 255, 0.95); /* Slightly transparent white */
  border-radius: 20px;
  padding: 12px 16px;
  max-width: 70%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #212121; /* Dark text for readability */
  word-wrap: break-word;
  transition: background-color 0.2s ease-in-out;
}

/* Differentiate inbound/outbound with subtle color tint */
.message-inbound .message-card {
  background-color: rgba(255, 255, 255, 0.95);
}

.message-outbound .message-card {
  background-color: rgba(235, 235, 235, 0.95);
}

.message-card .text-caption {
  font-size: 12px;
  margin-top: 6px;
  color: rgba(0, 0, 0, 0.4);
  font-weight: 500;
}
</style>
