<template>
  <div class="profile-view" v-if="viewedUser">
    <aside class="left-panel">
      <UserStats :user="viewedUser" />
      <div v-if="isOwnProfile && viewedUser.strikes > 0" class="strike-warning">
        ⚠️ You have {{ viewedUser.strikes }} strike{{ viewedUser.strikes > 1 ? 's' : '' }}.
        After 3 strikes, posting will be temporarily disabled.
      </div>
    </aside>

    <section class="main-feed">
      <PostFeed :userId="viewedUser.id" :title="`Posts by ${viewedUser.email}`" />
    </section>

    <aside class="right-panel" v-if="!isOwnProfile">
      <SuggestedFollowers :currentUser="currentUser" />
    </aside>
  </div>
</template>


<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { auth, firestore } from '../firebaseResources'
import { onAuthStateChanged } from 'firebase/auth'

import UserStats from '../components/UserStats.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'
import { computed } from 'vue'

const route = useRoute()
const viewedUser = ref(null)
const currentUser = ref(null)

const isOwnProfile = computed(() => {
  return currentUser.value?.uid === viewedUser.value?.id
})

const loadUser = async (userId) => {
  if (!userId) return
  try {
    const userDoc = await getDoc(doc(firestore, 'users', userId))
    if (userDoc.exists()) {
      viewedUser.value = { id: userDoc.id, ...userDoc.data() }
    } else {
      viewedUser.value = null
    }
  } catch (err) {
    console.error('Failed to load profile:', err)
    viewedUser.value = null
  }
}

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
  })
  loadUser(route.params.id)
})

// watch for route changes to reload profile
watch(() => route.params.id, (newId) => {
  loadUser(newId)
})
</script>

<style scoped>
.profile-view {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1.5rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f9f9f9;
  min-height: 100vh;
  box-sizing: border-box;
}
.strike-warning {
  margin-top: 1rem;
  padding: 0.75rem;
  border: 1px solid #ffcc00;
  background-color: #fff9e6;
  border-radius: 6px;
  font-weight: 500;
  color: #a06100;
}
.left-panel,
.right-panel,
.main-feed {
  background-color: #ffffff;
  border: 1px solid #ddd;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
