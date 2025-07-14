<template>
  <div class="login-panel">
    <h2>{{ isCreatingAccount ? 'Create Account' : 'Login' }}</h2>

    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />

    <div class="buttons">
      <button v-if="!isCreatingAccount" @click="login">Log In</button>
      <button v-else @click="createAccount">Create Account</button>

      <button v-if="isLoggedIn" @click="logout">Log Out</button>

      <button class="toggle" @click="toggleMode">
        {{ isCreatingAccount ? 'Already have an account? Log in' : "Don't have an account? Create one" }}
      </button>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="isLoggedIn"> Logged in as {{ auth.currentUser?.email }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { auth } from '../firebaseResources'
import { onAuthStateChanged } from 'firebase/auth'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoggedIn = ref(false)
const isCreatingAccount = ref(false)

const toggleMode = () => {
  isCreatingAccount.value = !isCreatingAccount.value
  errorMessage.value = ''
  email.value = ''
  password.value = ''
}

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

onAuthStateChanged(auth, (user) => {
  isLoggedIn.value = !!user
})
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
.toggle {
  background: none;
  border: none;
  color: #0077cc;
  text-decoration: underline;
  cursor: pointer;
}
.error {
  color: red;
  font-size: 0.9rem;
}
</style>
