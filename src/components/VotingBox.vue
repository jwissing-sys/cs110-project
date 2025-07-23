<template>
  <div v-if="!hasVoted" class="voting-box">
    <p>This post is under review. Cast your vote:</p>
    <div class="buttons">
      <button @click="submitVote('approve')">✅ Approve</button>
      <button @click="submitVote('reject')">❌ Reject</button>
    </div>
  </div>
  <p v-else class="thanks">🗳️ Vote submitted. Thank you!</p>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore'
import { firestore } from '../firebaseResources'

const props = defineProps({
  postId: String,
  userId: String
})

const hasVoted = ref(false)
const emit = defineEmits(['vote-submitted'])

const checkVoteStatus = async () => {
  if (!props.postId || !props.userId) return

  try {
    const postRef = doc(firestore, 'posts', props.postId)
    const postSnap = await getDoc(postRef)
    if (!postSnap.exists()) return

    const currentVotes = postSnap.data().votes || []
    hasVoted.value = currentVotes.some(v => v.userId === props.userId)
  } catch (e) {
    console.error('❌ Failed to check vote status:', e)
  }
}

watchEffect(() => {
  checkVoteStatus()
})

const submitVote = async (vote) => {
  if (!vote || !props.postId || !props.userId) return

  try {
    const postRef = doc(firestore, 'posts', props.postId)
    const postSnap = await getDoc(postRef)
    if (!postSnap.exists()) return

    const postData = postSnap.data()
    const currentVotes = postData.votes || []

    // Don't allow double voting
    if (currentVotes.some(v => v.userId === props.userId)) {
      hasVoted.value = true
      return
    }

    const updatedVotes = [...currentVotes, { userId: props.userId, vote }]

    // Status + Flagged defaults
    let status = null
    let flagged = true

    if (updatedVotes.length >= 3) {
      const voteCounts = updatedVotes.reduce((acc, v) => {
        acc[v.vote] = (acc[v.vote] || 0) + 1
        return acc
      }, {})

      const approve = voteCounts.approve || 0
      const reject = voteCounts.reject || 0

      if (approve >= 2) {
        status = 'approved'
        flagged = false
      } else if (reject >= 2) {
        status = 'rejected'
        flagged = false

        // Add strike and optional 24h ban
        const authorId = postData.authorId
        if (authorId) {
          const authorRef = doc(firestore, 'users', authorId)
          const authorSnap = await getDoc(authorRef)

          if (authorSnap.exists()) {
            const authorData = authorSnap.data()
            const currentStrikes = authorData.strikes || 0
            const newStrikes = currentStrikes + 1

            const updates = { strikes: newStrikes }

            if (newStrikes >= 3) {
              const banUntil = new Date(Date.now() + 24 * 60 * 60 * 1000)
              updates.bannedUntil = Timestamp.fromDate(banUntil)
            }

            await updateDoc(authorRef, updates)
          }
        }
      }
    }

    await updateDoc(postRef, {
      votes: updatedVotes,
      ...(status && { status }),
      flagged,
      needsReview: false
    })

    hasVoted.value = true
    emit('vote-submitted')
  } catch (e) {
    console.error('🔥 Vote failed:', e)
  }
}

</script>


<style scoped>
.voting-box {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px dashed #999;
  background: #f5f5f5;
  border-radius: 6px;
  text-align: center;
}
.buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
}
button {
  padding: 0.4rem 1rem;
  cursor: pointer;
}
.thanks {
  font-style: italic;
  color: #555;
  margin-top: 1rem;
  text-align: center;
}
</style>
