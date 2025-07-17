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

<script setup>
import { ref, watchEffect } from 'vue'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore'
import { firestore, auth } from '../firebaseResources'
import PostItem from './PostItem.vue'

const props = defineProps({
  posts: Array,        // optional preloaded list
  userId: String,      // profile mode ONLY
  title: {
    type: String,
    default: 'Recent Posts'
  }
})

const internalPosts = ref([])

watchEffect(async () => {
  const currentUserId = auth.currentUser?.uid || null

  // ----- CASE A: Pre-supplied posts -----
  if (props.posts?.length) {
    internalPosts.value = props.posts
    return
  }

  // ----- CASE B: Profile View (props.userId present) -----
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
      postIds
        .slice(-20)          // grab last 20 IDs; adjust if you like
        .reverse()
        .map(async (id) => {
          const snap = await getDoc(doc(firestore, 'posts', id))
          return snap.exists() ? { id: snap.id, ...snap.data() } : null
        })
    )

    internalPosts.value = postDocs
      .filter(Boolean)
      .sort((a, b) => {
        const at = a.timestamp?.seconds ?? a.timestamp?.toMillis?.() ?? 0
        const bt = b.timestamp?.seconds ?? b.timestamp?.toMillis?.() ?? 0
        return bt - at
      })
    return
  }

  // ----- CASE C: Global feed (not logged in) -----
  if (!currentUserId) {
    const postsQuery = query(
      collection(firestore, 'posts'),
      orderBy('timestamp', 'desc'),
      limit(10)
    )
    const snap = await getDocs(postsQuery)
    internalPosts.value = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    return
  }

  // ----- CASE D: Home feed (logged in, no userId prop) -----
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

  // Pull recent posts and filter by followed authors
  const postsQuery = query(
    collection(firestore, 'posts'),
    orderBy('timestamp', 'desc'),
    limit(30)
  )
  const snap = await getDocs(postsQuery)

  internalPosts.value = snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(post => followingIds.includes(post.authorId))
    // hedge: don't show own posts even if user somehow follows self
    .filter(post => post.authorId !== currentUserId)
    .sort((a, b) => {
      const at = a.timestamp?.seconds ?? a.timestamp?.toMillis?.() ?? 0
      const bt = b.timestamp?.seconds ?? b.timestamp?.toMillis?.() ?? 0
      return bt - at
    })
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
