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

import { moderatePost } from '../utils/moderationUtils'

const currentUser = inject('currentUser')
const content = ref('')
const emit = defineEmits(['post-created'])

async function submitPost() {
  const user = currentUser.value
  if (!user || !content.value.trim()) return

  const userRef = doc(firestore, 'users', user.uid)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) return

  const userData = userSnap.data()

  // Check if user is banned
  const now = new Date()
  const bannedUntil = userData.bannedUntil?.toDate?.()
  if (bannedUntil && bannedUntil > now) {
    alert(`Posting disabled until ${bannedUntil.toLocaleString()}`)
    return
  }

  // Moderate the post content
  const severity = moderatePost(content.value)

  if (severity === 'block') {
    alert('Your post was blocked due to inappropriate content.')

    const newStrikes = (userData.strikes || 0) + 1
    const updates = { strikes: newStrikes }

    if (newStrikes >= 3) {
      const banUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      updates.bannedUntil = banUntil
      alert(`You have been banned from posting for 24 hours.`)
    }

    await updateDoc(userRef, updates)
    content.value = ''
    return
  }

  const flagged = (severity === 'warn' || severity === 'review')

  // Create post
  const newPostRef = await addDoc(collection(firestore, 'posts'), {
    content: content.value,
    author: user.email,
    authorId: user.uid,
    timestamp: Timestamp.now(),
    flagged: flagged,
    votes: [] // for community voting later
  })

  const postId = newPostRef.id

  const updatedPosts = [...(userData.posts || []), postId]
  await updateDoc(userRef, { posts: updatedPosts })

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

  if (severity === 'warn') {
    alert('⚠️ Your post was allowed, but contains flagged language and will be reviewed.')
  }
  if (severity === 'review') {
    alert('Your post was queued for review before being public.')
  }

  content.value = ''
  emit('post-created')
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
