<template>
  <v-navigation-drawer app permanent width="300">
    <v-list>
      <v-list-item>
        <v-text-field
          v-model="newPhoneNumber"
          dense
          hide-details
          label="Start New Chat"
          placeholder="Enter phone number"
          @keyup.enter="startNewChat"
        />
        <v-btn :disabled="!newPhoneNumber.trim()" icon @click="startNewChat">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-list-item>

      <v-list-item
        v-for="chat in chats"
        :key="chat.phone"
        :active="chat.phone === selectedChat?.phone"
        @click="$emit('chat-selected', chat)"
      >
        <v-list-item-content>
          <v-list-item-title>{{ chat.phone }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
  import { ref } from 'vue'

  defineProps({
    chats: Array,
    selectedChat: Object,
  })

  const emit = defineEmits(['chat-selected'])
  const newPhoneNumber = ref('')

  function startNewChat () {
    const phone = newPhoneNumber.value.trim()
    if (!phone) return
    emit('chat-selected', { phone, messages: [] })
    newPhoneNumber.value = ''
  }
</script>
