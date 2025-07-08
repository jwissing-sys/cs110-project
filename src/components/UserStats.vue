<template>
  <div class="user-stats">
    <div v-if="user">
      <h3>{{ user.email }}</h3>
      <ul>
        <li>Posts: {{ user.posts.length }}</li>
        <li>Following: {{ user.following.length }}</li>
        <li>Followers: {{ user.followers.length }}</li>
      </ul>
    </div>
    <div v-else>
      <RouterLink to="/login">Log In</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
defineProps({
  user: Object
})
</script>

<style scoped>
.user-stats {
  border: 1px solid #ccc;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
}
</style>
