<template>
  <div class="review-queue">
    <h2> Flagged Posts Review</h2>
    <p v-if="!isReviewer">Access denied. This page is for reviewers only.</p>

    <div v-else>
      <p v-if="flaggedPosts.length === 0">🎉 No posts pending review!</p>

      <div
        v-for="post in flaggedPosts"
        :key="post.id"
        class="review-post"
      >
        <p><strong>Author:</strong> {{ post.author }}</p>
        <p><strong>Content:</strong> {{ post.content }}</p>
        <p><strong>Votes:</strong> {{ post.votes?.length || 0 }} / 3</p>

        <VotingBox
            :postId="post.id"
            :userId="currentUser?.uid"
            @vote-submitted="fetchFlaggedPosts"
        />

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { firestore } from '../firebaseResources'

import VotingBox from '../components/VotingBox.vue'

const currentUser = inject('currentUser')
const isReviewer = ref(false)
const flaggedPosts = ref([])

onMounted(() => {
  if (currentUser?.value?.role === 'reviewer') {
    isReviewer.value = true
    fetchFlaggedPosts()
  }
})

const fetchFlaggedPosts = async () => {
  const q = query(collection(firestore, 'posts'), where('flagged', '==', true))
  const querySnap = await getDocs(q)

  flaggedPosts.value = querySnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(post => (post.votes || []).length < 3)
}
</script>

<style scoped>
.review-queue {
  max-width: 700px;
  margin: auto;
  padding: 2rem;
}
.review-post {
  border: 1px solid #ccc;
  background: #f9f9ff;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}
</style>
