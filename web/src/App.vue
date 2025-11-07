<template>
  <v-app>
    <ChatLayout>
      <template #sidebar>
        <ChatList
          :chats="chats"
          :selected-chat="selectedChat"
          @chat-selected="selectChatOrCreate"
        />
      </template>
      <template #main>
        <ChatWindow
          v-if="selectedChat"
          :chat="selectedChat"
          @send-message="sendMessage"
        />
        <div v-else class="d-flex justify-center align-center" style="height: 100%">
          Select or start a chat.
        </div>
      </template>
    </ChatLayout>
  </v-app>
</template>

<script setup>
  import { ref } from 'vue'
  import ChatLayout from './components/ChatLayout.vue'
  import ChatList from './components/ChatList.vue'
  import ChatWindow from './components/ChatWindow.vue'
  import { useWebSocket } from './composables/useWebSocket'

  const { chats, selectedChat, selectChat, sendMessage } = useWebSocket('ws://localhost:8080')

  // Accept chat from ChatList or new chat creation, add if not exists, then select
  function selectChatOrCreate (chat) {
    const existing = chats.find(c => c.phone === chat.phone)
    if (!existing) {
      chats.push(chat)
    }
    selectChat(chat)
  }
</script>
