<script setup>
import { ref, watchEffect } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '../firebaseResources'

const props = defineProps({
  user: Object // must include .uid
})

const stats = ref({ posts: 0, followers: 0, following: 0 })

watchEffect(async () => {
  if (!props.user?.uid) return

  const userSnap = await getDoc(doc(firestore, 'users', props.user.uid))
  if (userSnap.exists()) {
    const data = userSnap.data()
    stats.value.posts = data.posts?.length || 0
    stats.value.followers = data.followers?.length || 0
    stats.value.following = data.following?.length || 0
  }
})
</script>

<template>
  <div>
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
