<script setup>
import { ref, watchEffect, onUnmounted, inject, computed } from 'vue'
import { doc, onSnapshot } from 'firebase/firestore'
import { firestore } from '../firebaseResources'
import { RouterLink } from 'vue-router'

const props = defineProps({
  user: Object
})

const fallbackUser = inject('currentUser')
const user = computed(() => props.user || fallbackUser.value)

const stats = ref({
  posts: 0,
  followers: 0,
  following: 0
})
const email = ref('')
let unsubscribe = null

watchEffect(() => {
  if (!user.value) return

  if (unsubscribe) unsubscribe()

  const userRef = doc(firestore, 'users', user.value.uid || user.value.id)
  unsubscribe = onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data()
      stats.value.posts = data.posts?.length || 0
      stats.value.followers = data.followers?.length || 0
      stats.value.following = data.following?.length || 0
      email.value = data.email || user.value.email || 'Unknown'
    }
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>


<template>
  <div class="user-stats">
    <h3>User Stats</h3>
    <p>Email: {{ email }}</p>
    <p>Posts: {{ stats.posts }}</p>
    <p>Followers: {{ stats.followers }}</p>
    <p>Following: {{ stats.following }}</p>

    <RouterLink
      v-if="user?.uid"
      :to="`/users/${user.uid}`"
      class="profile-link"
    >
      ➤ View your profile
    </RouterLink>
  </div>
</template>


<style scoped>
.user-stats {
  border: 1px solid #ccc;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
}
.profile-link {
  display: inline-block;
  margin-top: 0.5rem;
  font-weight: bold;
  color: #0077cc;
  text-decoration: underline;
}

</style>
