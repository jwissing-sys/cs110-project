<script setup>
import { ref } from 'vue'
import { auth, firestore } from '../firebaseResources'
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore'

import UserStats from '../components/UserStats.vue'
import PostInput from '../components/PostInput.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'

const user = ref(null)
const posts = ref([])

// Get current user info on load
auth.onAuthStateChanged(async (firebaseUser) => {
  if (firebaseUser) {
    user.value = {
      email: firebaseUser.email,
      uid: firebaseUser.uid
    }

    // Load user's feed posts
    const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid))
    const userData = userDoc.data()
    const feedIds = userData?.feed || []

    posts.value = []

    for (const id of feedIds.slice(0, 10)) {
      const postSnap = await getPostDoc(doc(firestore, 'posts', id))
      if (postSnap.exists()) {
        posts.value.push({
          id,
          ...postSnap.data()
        })
      }
    }

  } else {
    user.value = null
  }
})

// Submit a post to Firestore
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

    console.log('🟢 Creating new post in Firestore...')
    const postRef = await addDoc(collection(firestore, 'posts'), newPost)

    const userRef = doc(firestore, 'users', user.value.uid)
    console.log('🟢 Checking if user doc exists:', userRef.path)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      console.log('🟡 User doc does not exist. Creating...')
      await setDoc(userRef, {
        email: user.value.email,
        posts: [postRef.id],
        followers: [],
        following: []
      })
    } else {
      console.log('🟢 User doc found. Updating post list...')
      const userData = userSnap.data()
      const updatedPosts = [...(userData.posts || []), postRef.id]
      await updateDoc(userRef, { posts: updatedPosts })
    }

    alert('✅ Post submitted!')
    posts.value.unshift({
      id: postRef.id,
      ...newPost,
      timestamp: new Date().toISOString()
    })

  } catch (err) {
    console.error('🔥 Error in addPost:', err)
    alert('Post failed. Check console.')
  }
}

</script>



<template>
  <div class="home-container">
    <aside class="left-panel">
      <UserStats :user="user" />
    </aside>

    <section class="main-feed">
      <PostInput v-if="user" @post="addPost" />
      <PostFeed :posts="posts" />
    </section>

    <aside class="right-panel">
      <SuggestedFollowers :currentUser="user" />
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
