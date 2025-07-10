<script setup>
import { ref } from 'vue'
import { auth, firestore } from '../firebaseResources'
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
  getDoc
} from 'firebase/firestore'

import UserStats from '../components/UserStats.vue'
import PostInput from '../components/PostInput.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'

const user = ref(null)
const posts = ref([])
const isLoading = ref(false)

const loadUserFeed = async (uid) => {
  isLoading.value = true
  posts.value = []

  try {
    const userRef = doc(firestore, 'users', uid)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      const feedIds = userData.feed || []

      const limitedIds = feedIds.slice(-10).reverse() // most recent last

      for (const id of limitedIds) {
        const postSnap = await getDoc(doc(firestore, 'posts', id))
        if (postSnap.exists()) {
          posts.value.push({ id, ...postSnap.data() })
        }
      }
    }
  } catch (err) {
    console.error('⚠️ Failed to load user feed:', err)
  } finally {
    isLoading.value = false
  }
}

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

// Add a new post to Firestore
const addPost = async (newContent) => {
  if (!user.value) {
    alert('You must be logged in to post.')
    return
  }

  try {
    const newPost = {
      author: user.value.email,
      content: newContent,
      timestamp: serverTimestamp()
    }

    const postRef = await addDoc(collection(firestore, 'posts'), newPost)

    const userRef = doc(firestore, 'users', user.value.uid)
    const userDoc = await getDoc(userRef)
    const userData = userDoc.data()

    const updatedPosts = [...(userData.posts || []), postRef.id]

    await updateDoc(userRef, { posts: updatedPosts })

    // Immediately update UI
    posts.value.unshift({
      id: postRef.id,
      author: user.value.email,
      content: newContent,
      timestamp: new Date().toISOString()
    })

    alert('✅ Post submitted!')
  } catch (err) {
    console.error('🔥 Error in addPost:', err)
    alert('Post failed. Check console.')
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
      <PostFeed v-if="user" :userId="user.uid" title="Your Feed" />
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
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  background-color: #f9f9f9;
  padding: 2rem;
  box-sizing: border-box;

  max-width: 1200px;
  margin: 0 auto; /* center on large screens */
  min-height: 100vh;
}

.left-panel,
.right-panel {
  flex: 0 0 20%;
  background-color: #ffffff;
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.main-feed {
  flex: 1;
  min-width: 0; /* prevents overflow */
  background-color: #ffffff;
  border: 1px solid #ddd;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

@media (max-width: 900px) {
  .home-container {
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
