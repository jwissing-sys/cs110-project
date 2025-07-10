<template> 
  <div class="post-feed">
    <h3 class="feed-title">Recent Posts</h3>
    <p v-if="!posts.length" class="no-posts">No posts yet!</p>
    <PostItem v-for="post in posts" :key="post.id" :post="post" />
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
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.feed-title {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.no-posts {
  text-align: center;
  color: #777;
  margin-bottom: 1rem;
}
</style>

