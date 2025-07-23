<template>
  <div class="login-view" v-if="!currentUser">
    <LoginCreateAccount />
  </div>
</template>

<script setup>
import { inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import LoginCreateAccount from '../components/LoginCreateAccount.vue'

// Inject current user from App.vue
const currentUser = inject('currentUser')
const router = useRouter()

// Redirect to home if already logged in
watch(currentUser, (user) => {
  if (user) router.push('/')
}, { immediate: true })
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