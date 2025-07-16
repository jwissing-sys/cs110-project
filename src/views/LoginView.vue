<template>
  <div class="login-view">
    <LoginCreateAccount />
  </div>
</template>

<script setup>
import LoginCreateAccount from '../components/LoginCreateAccount.vue'
</script>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  min-height: 100vh;
  background-color: #f7f7f7;
}

@media (max-width: 600px) {
  .login-view {
    padding: 1rem;
  }
}
</style>