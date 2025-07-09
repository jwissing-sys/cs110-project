<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/login">Login/Create</RouterLink>
      <button v-if="isLoggedIn" @click="logout">Log Out</button>
    </nav>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { auth } from '../firebaseResources'
import { signOut } from 'firebase/auth'
const isLoggedIn = ref(false)

// Detect if a user is signed in
auth.onAuthStateChanged(user => {
  isLoggedIn.value = !!user
})

const logout = async () => {
  await signOut(auth)
  isLoggedIn.value = false
}
</script>

<style scoped>
header {
  background-color: #f5f5f5;
  padding: 1rem;
}

nav {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

nav a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
