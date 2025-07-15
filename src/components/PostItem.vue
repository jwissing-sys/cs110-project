<template>
  <div class="post-item">
    <div class="meta">
      <strong>{{ post.author || 'Unknown' }}</strong>
      <span class="timestamp">{{ formattedDate }}</span>
    </div>
    <p>{{ post.content || '[No content]' }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  post: Object
})

const formattedDate = computed(() => {
  const ts = props.post?.timestamp
  if (!ts) return ''

  // Support both Firebase Timestamp and ISO string
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return date.toLocaleString()
})
</script>


<style scoped>
.post-item {
  background-color: #fdfdfd;
  border: 1px solid #ddd;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #555;
}
</style>
