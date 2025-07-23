<script setup>
import { ref, watch, inject, computed } from 'vue'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { firestore } from '../firebaseResources'
import VotingBox from '../components/VotingBox.vue'

// Inject user context
const currentUser = inject('currentUser', ref(null))
const isReviewer = ref(false)

// State
const flaggedPosts = ref([])
const error = ref(null)
const loaded = ref(false)

// Fetch flagged posts from Firestore
const fetchFlaggedPosts = async () => {
  const q = collection(firestore, 'posts')
  const snap = await getDocs(q)

  flaggedPosts.value = snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(post => post.flagged || (post.votes?.length >= 3 && post.status))
}

// Computed: split posts into pending (<3 votes) and reviewed (>=3 votes)
const pendingPosts = computed(() =>
  flaggedPosts.value.filter(post => (post.votes || []).length < 3)
)
const reviewedPosts = computed(() =>
  flaggedPosts.value.filter(post => (post.votes || []).length >= 3)
)

// Watch currentUser and reload data
watch(currentUser, async (val) => {
  try {
    if (!val) {
      isReviewer.value = false
      flaggedPosts.value = []
      loaded.value = true
      return
    }

    isReviewer.value = ['reviewer', 'admin'].includes(val.role)
    if (isReviewer.value) await fetchFlaggedPosts()
    else flaggedPosts.value = []

    loaded.value = true
  } catch (e) {
    console.error('Caught error:', e)
    error.value = e.message
    loaded.value = true
  }
}, { immediate: true })
</script>

<template>
  <div class="review-queue">
    <h2>Flagged Posts Review</h2>

    <div v-if="!isReviewer && loaded">
      <p>🚫 Access denied. This page is for reviewers only.</p>
    </div>

    <div v-else-if="loaded">
      <!-- 📝 Pending Review Section -->
      <h3>📝 Pending Review</h3>
      <p v-if="pendingPosts.length === 0">🎉 No posts pending review!</p>

      <div
        v-for="post in pendingPosts"
        :key="post.id"
        class="review-post"
      >
        <p><strong>Author:</strong> {{ post.author || 'Unknown' }}</p>
        <p><strong>Content:</strong> {{ post.content }}</p>
        <p><strong>Votes:</strong> {{ post.votes?.length || 0 }} / 3</p>

        <VotingBox
          v-if="currentUser?.uid"
          :postId="post.id"
          :userId="currentUser.uid"
          @vote-submitted="fetchFlaggedPosts"
        />
      </div>

      <hr style="margin: 2rem 0;" />

      <!-- 📜 Already Reviewed Section -->
      <h3>📜 Already Reviewed</h3>
      <p v-if="reviewedPosts.length === 0">No posts have completed voting yet.</p>

      <div
        v-for="post in reviewedPosts"
        :key="post.id"
        class="review-post reviewed"
      >
        <p><strong>Author:</strong> {{ post.author || 'Unknown' }}</p>
        <p><strong>Content:</strong> {{ post.content }}</p>
        <p><strong>Final Status:</strong> ✅ {{ post.status || 'undecided' }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-queue {
  max-width: 800px;
  margin: auto;
  padding: 2rem;
}
.review-post {
  background: #f9f9ff;
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}
.review-post.reviewed {
  background-color: #eaf7ea;
}
</style>
