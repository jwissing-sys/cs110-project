<template>
  <div class="login-panel">
    <h2>Login / Create Account</h2>
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <div class="buttons">
      <button @click="login">Log In</button>
      <button @click="createAccount">Create Account</button>
      <button v-if="isLoggedIn" @click="logout">Log Out</button>
    </div>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="isLoggedIn">✅ Logged in as {{ auth.currentUser?.email }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { auth } from '../firebaseResources'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoggedIn = ref(false)

const login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    isLoggedIn.value = true
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = error.message
  }
}

const createAccount = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value)
    isLoggedIn.value = true
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = error.message
  }
}

const logout = async () => {
  try {
    await signOut(auth)
    isLoggedIn.value = false
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = error.message
  }
}
</script>

<style scoped>
.login-panel {
  max-width: 300px;
  margin: auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
}
input {
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.5rem;
}
.buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.error {
  color: red;
  font-size: 0.9rem;
}
</style>
