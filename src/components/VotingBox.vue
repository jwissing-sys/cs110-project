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
import { ref } from 'vue'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { firestore } from '../firebaseResources'

const props = defineProps({
  postId: String,
  userId: String // current user id
})

const hasVoted = ref(false)
const emit = defineEmits(['vote-submitted'])


const submitVote = async (vote) => {
  if (!vote || !props.postId || !props.userId) return

  const postRef = doc(firestore, 'posts', props.postId)
  const postSnap = await getDoc(postRef)
  if (!postSnap.exists()) return

  const postData = postSnap.data()
  const currentVotes = postData.votes || []

  const alreadyVoted = currentVotes.some(v => v.userId === props.userId)
  if (alreadyVoted) {
    hasVoted.value = true
    return
  }

  await updateDoc(postRef, {
    votes: arrayUnion({ userId: props.userId, vote: vote })
  })

  hasVoted.value = true
  emit('vote-submitted') // 👈 trigger parent refresh

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
