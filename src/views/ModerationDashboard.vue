<template>
  <div class="dashboard">
    <h2>🛠 Moderation Dashboard</h2>
    <p v-if="!isAdmin">Access denied. This page is for admins only.</p>

    <div v-else>
      <div v-if="flaggedPosts.length === 0">
        <p>No flagged posts found.</p>
      </div>

      <div v-for="post in flaggedPosts" :key="post.id" class="flagged-post">
        <p><strong>Author:</strong> {{ post.author }}</p>
        <p><strong>Content:</strong> {{ post.content }}</p>
        <p><strong>Votes:</strong> {{ formatVotes(post.votes) }}</p>

        <div class="buttons">
          <button @click="approvePost(post.id)">✅ Approve</button>
          <button @click="deletePost(post.id)">🗑 Delete</button>
          <button @click="strikeUser(post.authorId)">⚠️ Strike</button>
          <button @click="banUser(post.authorId)">🚫 Ban 24h</button>
        </div>
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
  doc,
  updateDoc,
  deleteDoc,
  increment,
} from 'firebase/firestore'
import { firestore } from '../firebaseResources'

const currentUser = inject('currentUser')
const isAdmin = ref(false)
const flaggedPosts = ref([])

onMounted(async () => {
  if (currentUser?.value?.role === 'admin') {
    isAdmin.value = true
    await fetchFlaggedPosts()
  }
})

const fetchFlaggedPosts = async () => {
  const q = query(collection(firestore, 'posts'), where('flagged', '==', true))
  const querySnap = await getDocs(q)
  flaggedPosts.value = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

const formatVotes = (votes = []) => {
  const tally = { approve: 0, reject: 0 }
  votes.forEach(v => {
    if (v.vote === 'approve') tally.approve++
    if (v.vote === 'reject') tally.reject++
  })
  return `✅ ${tally.approve} / ❌ ${tally.reject}`
}

const approvePost = async (postId) => {
  const ref = doc(firestore, 'posts', postId)
  await updateDoc(ref, { flagged: false })
  await fetchFlaggedPosts()
}

const deletePost = async (postId) => {
  const ref = doc(firestore, 'posts', postId)
  await deleteDoc(ref)
  await fetchFlaggedPosts()
}

const strikeUser = async (userId) => {
  const userRef = doc(firestore, 'users', userId)
  await updateDoc(userRef, {
    strikes: increment(1)
  })
  alert('Strike issued.')
}

const banUser = async (userId) => {
  const userRef = doc(firestore, 'users', userId)
  const bannedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000)
  await updateDoc(userRef, {
    bannedUntil: bannedUntil
  })
  alert('User banned for 24 hours.')
}
</script>

<style scoped>
.dashboard {
  max-width: 700px;
  margin: auto;
  padding: 2rem;
}
.flagged-post {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  background: #fff6f6;
}
.buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
button {
  padding: 0.4rem 1rem;
  cursor: pointer;
}
</style>
