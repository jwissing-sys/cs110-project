<template>
  <header>
    <nav>
      <div class="nav-left">
        <RouterLink to="/">Home</RouterLink>

        <!-- Only show if user is a reviewer -->
        <RouterLink
          v-if="currentUser?.role === 'reviewer'"
          to="/flagged-posts-review"
        >
          Review Posts
        </RouterLink>
      </div>

      <div class="nav-right">
        <RouterLink v-if="!isLoggedIn" to="/login">Login/Create</RouterLink>
        <button v-if="isLoggedIn" @click="logout">Log Out</button>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { ref, inject, watch } from 'vue'
import { auth } from '../firebaseResources'
import { signOut, onAuthStateChanged } from 'firebase/auth'

// 👤 Inject currentUser from App.vue
const currentUser = inject('currentUser', ref(null))

// Track login status
const isLoggedIn = ref(false)

onAuthStateChanged(auth, (user) => {
  isLoggedIn.value = !!user
})

// 🔓 Handle logout
const router = useRouter()
const logout = async () => {
  await signOut(auth)
  isLoggedIn.value = false
  router.push('/')
}

// Debugging
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

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
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
