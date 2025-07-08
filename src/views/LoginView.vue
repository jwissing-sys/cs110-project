<template>
  <div class="login-view">
    <AuthPanel />
  </div>
</template>

<script setup>
import AuthPanel from '../components/AuthPanel.vue'
</script>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  padding: 2rem;
}
</style>
