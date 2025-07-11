<template>
  <div class="profile-view">
    <aside class="left-panel" v-if="viewedUser">
      <UserStats :user="viewedUser" />
    </aside>

    <section class="main-feed">
      <h2>Posts by {{ viewedUser?.email }}</h2>
      <PostFeed :userId="viewedUser?.id" />
    </section>

    <aside class="right-panel" v-if="viewedUser">
      <SuggestedFollowers
        :customList="[viewedUser]"
        :title="`Follow ${viewedUser.email}`"
      />
    </aside>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '../firebaseResources'

import UserStats from '../components/UserStats.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'

const route = useRoute()
const viewedUser = ref(null)

watchEffect(async () => {
  const userId = route.params.id
  if (!userId) return

  const userDoc = await getDoc(doc(firestore, 'users', userId))
  if (userDoc.exists()) {
    viewedUser.value = {
      id: userDoc.id,
      ...userDoc.data()
    }
  } else {
    viewedUser.value = null
  }
})
</script>

<style scoped>
.profile-view {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f9f9f9;
  min-height: 100vh;
  box-sizing: border-box;
}

.left-panel,
.right-panel {
  flex: 0 0 20%;
  background-color: #ffffff;
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.main-feed {
  flex: 1;
  min-width: 0;
  background-color: #ffffff;
  border: 1px solid #ddd;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
