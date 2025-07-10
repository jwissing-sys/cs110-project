<script setup>
import { RouterView } from 'vue-router'
import NavigationBar from './components/NavigationBar.vue'
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
