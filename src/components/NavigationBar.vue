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
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 960px;
  margin: 0 auto;
}

nav a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

nav a.router-link-exact-active {
  color: #42b983;
}

button {
  background: none;
  border: none;
  color: #c00;
  font-weight: bold;
  cursor: pointer;
}
</style>
