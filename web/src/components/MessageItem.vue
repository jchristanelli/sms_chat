<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'

  const now = ref(Date.now())
  let timeoutId: number | null = null

  function updateNow () {
    now.value = Date.now()
    timeoutId = window.setTimeout(updateNow, 60 * 1000)
  }

  onMounted(() => {
    updateNow() // start the first timer
  })

  onUnmounted(() => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
  })

  const props = defineProps({
    message: {
      type: Object,
      required: true,
    },
  })

  const isOutbound = computed(() => props.message.isOutbound)

  function formatTime (timestamp: number, sid: string) {
    if (!sid) {
      // Show "sending..." if no sid (meaning we dont know if it went through)
      return 'Sending...'
    }

    const date = new Date(timestamp)
    const now = new Date()
    const diffMs: number = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60_000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }
</script>

<template>
  <div
    class="message-wrapper mb-3"
    :class="{ 'message-outbound': isOutbound, 'message-inbound': !isOutbound }"
  >
    <v-card
      class="message-card pa-3"
      :class="isOutbound ? 'text-white' : 'text-black'"
      :color="isOutbound ? 'primary' : 'grey-lighten-3'"
      elevation="1"
      rounded="lg"
    >
      <div class="text-body-1">{{ message.text || message.body }}</div>
      <div
        class="text-caption mt-1"
        :class="isOutbound ? 'text-white' : 'text-grey-darken-1'"
      >
        {{ formatTime(message.timestamp, message.sid) }}
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.message-wrapper {
  display: flex;
  width: 100%;
}

.message-inbound {
  justify-content: flex-start;
}

.message-outbound {
  justify-content: flex-end;
}

.message-card {
  max-width: 70%;
  word-wrap: break-word;
}

@media (max-width: 600px) {
  .message-card {
    max-width: 85%;
  }
}
</style>
