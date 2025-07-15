<script setup>
import { ref, onMounted } from 'vue'
import { auth, firestore } from '../firebaseResources'
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'

import UserStats from '../components/UserStats.vue'
import PostInput from '../components/PostInput.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'

const user = ref(null)
const posts = ref([])
const isLoading = ref(false)
const feedKey = ref(0)

onMounted(() => {
  auth.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      user.value = {
        email: firebaseUser.email,
        uid: firebaseUser.uid
      }
      await loadUserFeed(firebaseUser.uid)
    } else {
      user.value = null
      posts.value = []
    }
  })
})

const loadUserFeed = async (uid) => {
  isLoading.value = true
  posts.value = []

  try {
    const userRef = doc(firestore, 'users', uid)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) return

    const feedIds = userSnap.data().feed || []
    const postIds = userSnap.data().posts || []
    const combined = [...new Set([...feedIds, ...postIds])]

    const fetched = await Promise.all(
      combined.slice(-10).reverse().map(async (id) => {
        const snap = await getDoc(doc(firestore, 'posts', id))
        return snap.exists() ? { id, ...snap.data() } : null
      })
    )

    posts.value = fetched.filter(Boolean)
  } catch (err) {
    console.error('Failed to load feed:', err)
  } finally {
    isLoading.value = false
  }
}

const addPost = async (content) => {
  if (!user.value || !content.trim()) {
    alert('You must be logged in and write something.')
    return
  }

  try {
    // 1. Add post with unresolved timestamp
    const postRef = await addDoc(collection(firestore, 'posts'), {
      content,
      author: user.value.email,
      timestamp: serverTimestamp()
    })

    // 2. Get the resolved post back
    const postSnap = await getDoc(postRef)
    if (!postSnap.exists()) return
    const postData = postSnap.data()

    // 3. Update current user's document
    const userRef = doc(firestore, 'users', user.value.uid)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) return

    const userData = userSnap.data()
    const updatedPosts = [...(userData.posts || []), postRef.id]
    const updatedFeed = [...(userData.feed || []), postRef.id]

    await updateDoc(userRef, {
      posts: updatedPosts,
      feed: updatedFeed
    })

    // 4. Add post to followers' feeds
    const followers = userData.followers || []
    await Promise.all(
      followers.map(async (followerId) => {
        const followerRef = doc(firestore, 'users', followerId)
        const followerSnap = await getDoc(followerRef)
        if (!followerSnap.exists()) return

        const followerData = followerSnap.data()
        const followerFeed = [...(followerData.feed || []), postRef.id]
        await updateDoc(followerRef, { feed: followerFeed })
      })
    )

    // 5. Refresh feed UI
    await loadUserFeed(user.value.uid)
  } catch (err) {
    console.error('Error adding post:', err)
    alert('Failed to post. See console.')
  }
}
</script>

<template>
  <div class="home-container">
    <aside class="left-panel" v-if="user">
      <UserStats :user="user" />
    </aside>

    <section class="main-feed">
      <PostInput v-if="user" @post="addPost" />
      <PostFeed v-if="user" :userId="user.uid" :key="feedKey" title="Your Feed" />
      <PostFeed v-else title="Global Feed" />
    </section>

    <aside class="right-panel">
      <SuggestedFollowers v-if="user" :currentUser="user" />
      <SuggestedFollowers v-else :customList="[]" title="Suggested Users" />
    </aside>
  </div>
</template>



<style scoped>
.home-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1.5rem;
  background-color: #f9f9f9;
  padding: 2rem;
  box-sizing: border-box;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

.left-panel,
.right-panel,
.main-feed {
  background-color: #ffffff;
  border: 1px solid #ddd;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Responsive stacking layout */
@media (max-width: 900px) {
  .home-container {
    display: flex;
    flex-direction: column;
    padding: 1rem;
  }

  .left-panel,
  .right-panel,
  .main-feed {
    width: 100%;
  }
}
</style>
