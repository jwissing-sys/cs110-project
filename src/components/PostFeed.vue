<template>
  <div class="post-feed">
    <h3 style="text-align: center; margin-top: 1rem;">Recent Posts</h3>
    <PostItem v-for="post in posts" :key="post.id" :post="post" />
    <p v-if="!posts.length">No posts yet!</p>
  </div>
</template>

<script setup>
import PostItem from './PostItem.vue'

defineProps({
  posts: Array
})
</script>

<style scoped>
.post-feed {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
