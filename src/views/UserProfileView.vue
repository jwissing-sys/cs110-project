<template>
  <div class="profile-view" v-if="viewedUser">
    <aside class="left-panel">
      <UserStats :user="viewedUser" />
    </aside>

    <section class="main-feed">
      <PostFeed :userId="viewedUser.id" :title="`Posts by ${viewedUser.email}`" />
    </section>

    <aside class="right-panel" v-if="currentUser?.uid !== viewedUser.id">
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

const route = useRoute()
const viewedUser = ref(null)
const currentUser = ref(null)

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
