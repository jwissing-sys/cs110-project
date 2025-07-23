<script setup>
import { ref, watchEffect } from 'vue'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where
} from 'firebase/firestore'
import { firestore, auth } from '../firebaseResources'
import PostItem from './PostItem.vue'

const props = defineProps({
  posts: Array,
  userId: String,
  title: {
    type: String,
    default: 'Recent Posts'
  }
})

const internalPosts = ref([])

watchEffect(async () => {
  const currentUserId = auth.currentUser?.uid || null

  // ----- A. Pre-supplied posts -----
  if (props.posts?.length) {
    internalPosts.value = props.posts
    return
  }

  // ----- B. Profile Feed -----
  if (props.userId) {
    const userRef = doc(firestore, 'users', props.userId)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
      internalPosts.value = []
      return
    }

    const userData = userSnap.data()
    const postIds = userData.posts || []

    const postDocs = await Promise.all(
      postIds.slice(-20).reverse().map(async (id) => {
        const snap = await getDoc(doc(firestore, 'posts', id))
        return snap.exists() ? { id: snap.id, ...snap.data() } : null
      })
    )

    internalPosts.value = postDocs
      .filter(Boolean)
      .filter(post => post.status !== 'rejected')
      .sort((a, b) => {
        const at = a.timestamp?.seconds ?? a.timestamp?.toMillis?.() ?? 0
        const bt = b.timestamp?.seconds ?? b.timestamp?.toMillis?.() ?? 0
        return bt - at
      })
    return
  }

  // ----- C. Global Feed (logged out) -----
  if (!currentUserId) {
    const postsQuery = query(
      collection(firestore, 'posts'),
      orderBy('timestamp', 'desc'),
      limit(30)
    )

    const snap = await getDocs(postsQuery)
    internalPosts.value = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(post => {
        const isUnflagged = post.flagged === false || post.flagged === undefined
        const isApproved = post.status === 'approved'
        return (isUnflagged || isApproved) && post.status !== 'rejected'
      })
      .sort((a, b) => {
        const at = a.timestamp?.seconds ?? a.timestamp?.toMillis?.() ?? 0
        const bt = b.timestamp?.seconds ?? b.timestamp?.toMillis?.() ?? 0
        return bt - at
      })

    console.log('🌐 Global feed loaded. Posts:', internalPosts.value)
    return
  }

  // ----- D. Home Feed (logged in, no userId) -----
  const userRef = doc(firestore, 'users', currentUserId)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) {
    internalPosts.value = []
    return
  }

  const userData = userSnap.data()
  const followingIds = userData.following || []

  if (!followingIds.length) {
    internalPosts.value = []
    return
  }

  const postsQuery = query(
    collection(firestore, 'posts'),
    where('flagged', 'in', [false, null]),
    where('status', 'in', ['approved', null]),
    orderBy('timestamp', 'desc'),
    limit(30)
  )

  const snap = await getDocs(postsQuery)
  internalPosts.value = snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(post => followingIds.includes(post.authorId))
    .filter(post => post.authorId !== currentUserId)
    .sort((a, b) => {
      const at = a.timestamp?.seconds ?? a.timestamp?.toMillis?.() ?? 0
      const bt = b.timestamp?.seconds ?? b.timestamp?.toMillis?.() ?? 0
      return bt - at
    })
})
</script>

<template>
  <div class="post-feed">
    <h3 class="feed-title">{{ title }}</h3>
    <p v-if="!internalPosts.length" class="no-posts">No posts yet!</p>
    <PostItem
      v-for="post in internalPosts"
      :key="post.id"
      :post="post"
    />
  </div>
</template>

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
