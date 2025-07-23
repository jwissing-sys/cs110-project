<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/login">Login/Create</RouterLink>

      <!-- ✅ Show only if role is reviewer or admin -->
      <RouterLink
        v-if="currentUser?.role === 'reviewer' || currentUser?.role === 'admin'"
        to="/flagged-posts-review"
      >
        Review Posts
      </RouterLink>

      <button v-if="isLoggedIn" @click="logout">Log Out</button>
    </nav>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { ref, inject, watch } from 'vue'
import { auth } from '../firebaseResources'
import { signOut } from 'firebase/auth'

// Track current user role (injected from App.vue)
const currentUser = inject('currentUser', ref(null))

// Track whether someone is logged in
const isLoggedIn = ref(false)
auth.onAuthStateChanged(user => {
  isLoggedIn.value = !!user
})

// Handle logout
const logout = async () => {
  await signOut(auth)
  isLoggedIn.value = false
}

// Debug currentUser injection
watch(currentUser, (val) => {
  console.log('🔍 NavigationBar currentUser:', val)
})
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
  margin-right: 1rem;
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
