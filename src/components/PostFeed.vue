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
import { firestore } from '../firebaseResources'
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
  if (props.posts?.length) {
    internalPosts.value = props.posts
    return
  }

  if (props.userId) {
    const userRef = doc(firestore, 'users', props.userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const data = userSnap.data()
      const feedIds = data.feed || []
      const postIds = data.posts || []

      const combinedIds = [...new Set([...feedIds, ...postIds])]

      const postDocs = await Promise.all(
        combinedIds.slice(-10).reverse().map(async (id) => {
          const snap = await getDoc(doc(firestore, 'posts', id))
          return snap.exists() ? { id: snap.id, ...snap.data() } : null
        })
      )

      internalPosts.value = postDocs
        .filter(Boolean)
        .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)
    }
  } else {
    const postsQuery = query(
      collection(firestore, 'posts'),
      orderBy('timestamp', 'desc'),
      limit(10)
    )
    const snap = await getDocs(postsQuery)
    internalPosts.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }
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
