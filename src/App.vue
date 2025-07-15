<script setup>
import { RouterView } from 'vue-router'
import { provide, ref, onMounted } from 'vue'
import { auth } from './firebaseResources'
import { onAuthStateChanged } from 'firebase/auth'
import NavigationBar from './components/NavigationBar.vue'

const currentUser = ref(null)
provide('currentUser', currentUser)

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
  })
})
</script>

<template>
  <NavigationBar />
  <main>
    <RouterView />
  </main>
</template>

<!-- Global styles must not be scoped -->
<style>
body {
  padding-top: 80px;
}
</style>

<style scoped>
main {
  padding: 2rem;
}
</style>
