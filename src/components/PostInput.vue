<template>
  <div v-if="currentUser" class="post-input">
    <h3>Create a Post</h3>
    <form @submit.prevent="submitPost">
      <textarea v-model.trim="content" placeholder="What's on your mind?" required></textarea>
      <button type="submit" :disabled="!content">Post</button>
    </form>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { firestore } from '../firebaseResources'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore'

const currentUser = inject('currentUser')
const content = ref('')
const emit = defineEmits(['post-created'])

async function submitPost() {
  const user = currentUser.value
  if (!user || !content.value.trim()) return

  try {
    const newPostRef = await addDoc(collection(firestore, 'posts'), {
      content: content.value,
      author: user.email,
      timestamp: Timestamp.now()
    })
    const postId = newPostRef.id

    const userRef = doc(firestore, 'users', user.uid)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) return

    const userData = userSnap.data()
    const updatedPosts = [...(userData.posts || []), postId]
    const updatedFeed = [...(userData.feed || []), postId]

    await updateDoc(userRef, {
      posts: updatedPosts,
      feed: updatedFeed
    })

    const followers = userData.followers || []
    await Promise.all(
      followers.map(async (followerId) => {
        const followerRef = doc(firestore, 'users', followerId)
        const followerSnap = await getDoc(followerRef)
        if (!followerSnap.exists()) return

        const followerData = followerSnap.data()
        const followerFeed = [...(followerData.feed || []), postId]
        await updateDoc(followerRef, { feed: followerFeed })
      })
    )

    content.value = ''
    emit('post-created')  // Parent component should reload feed on this
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
