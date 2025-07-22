<template>
  <div class="post-item">
    <div class="meta">
      <strong>{{ post.author || 'Unknown' }}</strong>
      <span class="timestamp">{{ formattedDate }}</span>
    </div>

    <p>{{ post.content || '[No content]' }}</p>

    <div v-if="post.flagged" class="flag-label">⚠️ Flagged Post</div>

    <!-- VotingBox shown only to reviewers -->
    <VotingBox
      v-if="post.flagged && isReviewer && post.id && currentUser?.uid"
      :postId="post.id"
      :userId="currentUser.uid"
    />
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import VotingBox from './VotingBox.vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

// Inject currentUser from parent (e.g., HomeView)
const currentUser = inject('currentUser')
const isReviewer = computed(() => currentUser?.value?.role === 'reviewer')

const formattedDate = computed(() => {
  const ts = props.post?.timestamp
  if (!ts) return 'Unknown date'

  try {
    const date = ts.toDate ? ts.toDate() : new Date(ts)
    return date.toLocaleString()
  } catch {
    return 'Invalid date'
  }
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

.flag-label {
  color: #b30000;
  font-weight: bold;
  margin-top: 0.5rem;
}
</style>

