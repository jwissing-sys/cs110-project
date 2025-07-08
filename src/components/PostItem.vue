<template>
  <div class="post-item">
    <div class="meta">
      <strong>{{ post.author }}</strong>
      <span class="timestamp">{{ formattedDate }}</span>
    </div>
    <p>{{ post.content }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
defineProps({
  post: Object
})

const formattedDate = computed(() =>
  new Date(post.timestamp).toLocaleString()
)
</script>

<style scoped>
.post-item {
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 6px;
  background-color: #fafafa;
}
.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #555;
}
</style>
