<template>
  <v-form class="d-flex w-100 ga-2" @submit.prevent="handleSend">
    <v-text-field
      v-model="messageText"
      autofocus
      class="flex-grow-1"
      density="comfortable"
      :disabled="disabled"
      hide-details
      placeholder="Type a message..."
      variant="outlined"
      @keydown.enter.exact.prevent="handleSend"
    />

    <v-btn
      color="primary"
      :disabled="!messageText.trim() || disabled"
      icon="mdi-send"
      size="large"
      type="submit"
    />
  </v-form>
</template>

<script setup>
  import { ref } from 'vue'

  const props = defineProps({
    disabled: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['send'])

  const messageText = ref('')

  function handleSend () {
    const text = messageText.value.trim()
    if (text && !props.disabled) {
      emit('send', text)
      messageText.value = ''
    }
  }
</script>
