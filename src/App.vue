<script setup>
import { RouterLink, RouterView } from 'vue-router'
import NavigationBar from './components/NavigationBar.vue'
</script>

<template>
  <NavigationBar />
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
main {
  padding: 2rem;
}
</style>