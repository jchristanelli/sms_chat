<template>
  <v-container class="d-flex" fluid style="height: 100vh;">
    <div style="flex: 0 0 300px;">
      <slot name="sidebar" />
    </div>
    <div style="flex: 1 1 auto; min-width: 0;">
      <slot name="main" />
    </div>
  </v-container>
</template>

<script setup>
</script>

<style scoped>
</style>
