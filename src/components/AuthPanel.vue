<template>
  <div class="auth-panel">
    <div v-if="loggedIn">
      <p>Welcome, {{ email }}!</p>
      <button @click="logout">Log Out</button>
    </div>

    <div v-else>
      <div class="toggle-buttons">
        <button :class="{ active: mode === 'login' }" @click="mode = 'login'">Login</button>
        <button :class="{ active: mode === 'create' }" @click="mode = 'create'">Create Account</button>
      </div>

      <form @submit.prevent="submit">
        <input v-model="formEmail" type="email" placeholder="Email" required />
        <input v-model="formPassword" type="password" placeholder="Password" required />
        <button type="submit">
          {{ mode === 'login' ? 'Log In' : 'Create Account' }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mode = ref('login') // or 'create'
const formEmail = ref('')
const formPassword = ref('')
const email = ref('')
const loggedIn = ref(false)
const error = ref('')

// hardcoded mock credentials
const validEmail = 'user@example.com'
const validPassword = 'password123'

function submit() {
  error.value = ''

  if (mode.value === 'login') {
    if (formEmail.value === validEmail && formPassword.value === validPassword) {
      email.value = formEmail.value
      loggedIn.value = true
      formEmail.value = ''
      formPassword.value = ''
    } else {
      error.value = 'Invalid credentials'
    }
  } else if (mode.value === 'create') {
    // mock account creation
    email.value = formEmail.value
    loggedIn.value = true
    formEmail.value = ''
    formPassword.value = ''
  }
}

function logout() {
  loggedIn.value = false
  email.value = ''
}
</script>

<style scoped>
.auth-panel {
  width: 300px;
  border: 1px solid #ccc;
  padding: 2rem;
  border-radius: 8px;
  background: #fafafa;
}

.toggle-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

button.active {
  font-weight: bold;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error {
  color: red;
  margin-top: 0.5rem;
}
</style>
