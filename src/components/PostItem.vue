<template>
  <div class="post-item">
    <div class="meta">
      <strong>{{ post.author || 'Unknown' }}</strong>
      <span class="timestamp">{{ formattedDate }}</span>
    </div>

    <!-- Spoiler toggle -->
    <div v-if="post.needsReview && !revealed" class="spoiler-warning">
      ⚠️ Spoiler alert: This post may contain sensitive content.
      <button class="reveal-button" @click="revealed = true">Show Spoiler</button>
    </div>

    <!-- Show content only if not a spoiler or revealed -->
    <p v-if="!post.needsReview || revealed">{{ post.content || '[No content]' }}</p>

    <div v-if="post.flagged" class="flag-label">⚠️ Flagged Post</div>

    <VotingBox
      v-if="post.flagged && isReviewer && post.id && currentUser?.uid"
      :postId="post.id"
      :userId="currentUser.uid"
    />
  </div>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import VotingBox from './VotingBox.vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const currentUser = inject('currentUser')
const isReviewer = computed(() => currentUser?.value?.role === 'reviewer')

// Show/hide spoiler content
const revealed = ref(false)

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

.spoiler-warning {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.reveal-button {
  display: inline-block;
  margin-top: 0.3rem;
  padding: 0.3rem 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  background-color: #fffae6;
  border: 1px solid #d8c88a;
  border-radius: 4px;
}
</style>
