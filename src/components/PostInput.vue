<template>
  <div v-if="currentUser && !isBanned" class="post-input">
    <h3>Create a Post</h3>
    <form @submit.prevent="submitPost">
      <textarea v-model.trim="content" placeholder="What's on your mind?" required></textarea>
      <button type="submit" :disabled="!content">Post</button>
    </form>
  </div>
</template>

<script setup>
import { ref, inject, watchEffect } from 'vue'
import { firestore } from '../firebaseResources'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  Timestamp
} from 'firebase/firestore'

import { moderatePost } from '../utils/moderationUtils'

const currentUser = inject('currentUser')
const content = ref('')
const isBanned = ref(false)
const emit = defineEmits(['post-created'])

// 🔁 Watch for changes to currentUser and reactively update isBanned
watchEffect(() => {
  if (!currentUser.value) {
    isBanned.value = false
    return
  }

  const userRef = doc(firestore, 'users', currentUser.value.uid)
  const unsubscribe = onSnapshot(userRef, (snap) => {
    if (!snap.exists()) {
      isBanned.value = false
      return
    }

    const data = snap.data()
    const bannedUntil = data.bannedUntil?.toDate?.()
    const now = new Date()
    isBanned.value = bannedUntil && bannedUntil > now
  })

  // Cleanup
  return () => unsubscribe()
})

async function submitPost() {
  const user = currentUser.value
  if (!user || !content.value.trim()) return

  const userRef = doc(firestore, 'users', user.uid)
  const userSnap = await getDoc(userRef)
  if (!userSnap.exists()) return

  const userData = userSnap.data()

  const now = new Date()
  const bannedUntil = userData.bannedUntil?.toDate?.()
  if (bannedUntil && bannedUntil > now) {
    alert(`Posting disabled until ${bannedUntil.toLocaleString()}`)
    return
  }

  const severity = moderatePost(content.value)
  console.log('Moderation result:', severity)

  if (severity === 'block') {
    alert('🚫 Your post was blocked due to inappropriate content.')

    const newStrikes = (userData.strikes || 0) + 1
    const updates = { strikes: newStrikes }

    if (newStrikes >= 3) {
      const banUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      updates.bannedUntil = Timestamp.fromDate(banUntil)
      alert(`🚫 You have been banned from posting for 24 hours.`)
    }

    await updateDoc(userRef, updates)
    content.value = ''
    return
  }

  const flagged = (severity === 'warn')
  const needsReview = (severity === 'review')

  const newPostRef = await addDoc(collection(firestore, 'posts'), {
    content: content.value,
    author: user.email,
    authorId: user.uid,
    timestamp: Timestamp.now(),
    flagged,
    needsReview,
    votes: []
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
    alert('⚠️ Your post was allowed, but needs to be reviewed to be seen.')
  } else if (severity === 'review') {
    alert('🕵️ Your post was marked for review, but it is visible with a spoiler warning.')
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
