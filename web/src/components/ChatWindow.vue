<template>
  <v-card class="d-flex flex-column" style="height: 100%; max-height: 100%;">
    <v-card-text class="flex-grow-1 d-flex flex-column" style="overflow-y: auto; min-height: 0;">
      <div v-for="(message, idx) in chat.messages" :key="idx" class="mb-2">
        <strong>{{ message.from }}:</strong> {{ message.text }}<br>
        <small class="text--secondary">{{ new Date(message.timestamp).toLocaleTimeString() }}</small>
      </div>
    </v-card-text>

    <v-card-actions class="pa-2">
      <v-textarea
        v-model="messageText"
        auto-grow
        clearable
        dense
        label="Type your message"
        outlined
        rows="2"
        style="max-height: calc(6 * 1.5em); overflow-y: auto;"
        @keyup.enter="handleSend"
      />
      <v-btn class="ml-2" color="primary" :disabled="!messageText.trim()" @click="handleSend">
        Send
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
  import { nextTick, ref, watch } from 'vue'

  const props = defineProps({
    chat: {
      type: Object,
      required: true,
      default: () => ({ messages: [] }),
    },
  })

  const emit = defineEmits(['send-message'])
  const messageText = ref('')
  const chatContainer = ref(null)

  watch(
    () => props.chat.messages.length,
    async () => {
      await nextTick()
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    },
  )

  function handleSend () {
    if (!messageText.value.trim()) return
    emit('send-message', messageText.value.trim())
    messageText.value = ''
  }
</script>

<style scoped>
.v-card-text {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  min-height: 0;
}
</style>
