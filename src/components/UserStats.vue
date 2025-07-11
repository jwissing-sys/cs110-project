<script setup>
import { ref, watchEffect } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '../firebaseResources'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const stats = ref({
  posts: 0,
  followers: 0,
  following: 0
})

watchEffect(() => {
  fetchStats()
})

async function fetchStats() {  
  if (!props.user?.id && !props.user?.uid) return

  const userId = props.user.uid || props.user.id
  const userRef = doc(firestore, 'users', userId)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    const data = userSnap.data()
    stats.value.posts = data.posts?.length || 0
    stats.value.followers = data.followers?.length || 0
    stats.value.following = data.following?.length || 0
  }
}
</script>

<template>
  <div class="user-stats">
    <h3>User Stats</h3>
    <p>Email: {{ user?.email }}</p>
    <p>Posts: {{ stats.posts }}</p>
    <p>Followers: {{ stats.followers }}</p>
    <p>Following: {{ stats.following }}</p>
  </div>
</template>

<style scoped>
.user-stats {
  border: 1px solid #ccc;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
}
</style>
