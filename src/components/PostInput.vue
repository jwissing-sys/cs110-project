<template>
  <div class="post-input">
    <h3>Create a Post</h3>
    <form @submit.prevent="submitPost">
      <textarea v-model.trim="content" placeholder="What's on your mind?" required></textarea>
      <button type="submit" :disabled="!content">Post</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { auth, firestore } from '../firebaseResources'
import { addDoc, collection, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'

const content = ref('')

async function submitPost() {
  const user = auth.currentUser
  if (!user || !content.value.trim()) return

  try {
    // 1. Create new post
    const newPostRef = await addDoc(collection(firestore, 'posts'), {
      content: content.value,
      author: user.email,
      timestamp: Timestamp.now()
    })

    const postId = newPostRef.id

    // 2. Get current user's Firestore doc
    const userDocRef = doc(firestore, 'users', user.uid)
    const userSnap = await getDoc(userDocRef)
    if (!userSnap.exists()) return

    const userData = userSnap.data()
    const updatedPosts = [...(userData.posts || []), postId]

    // 3. Update user's posts array
    await updateDoc(userDocRef, {
      posts: updatedPosts
    })

    // 4. Push post to all followers' feeds
    const followers = userData.followers || []
    await Promise.all(
      followers.map(async (followerId) => {
        const followerRef = doc(firestore, 'users', followerId)
        const followerSnap = await getDoc(followerRef)
        if (!followerSnap.exists()) return

        const followerData = followerSnap.data()
        const updatedFeed = [...(followerData.feed || []), postId]
        await updateDoc(followerRef, { feed: updatedFeed })
      })
    )

    content.value = '' // clear input
  } catch (err) {
    console.error('Failed to post:', err)
  }
}
</script>

<style scoped>
.post-input {
  margin-bottom: 1.5rem;
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 6px;
  background: #fff;
}
form {
  display: flex;
  flex-direction: column;
}
textarea {
  width: 100%;
  height: 80px;
  margin-bottom: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
}
</style>
