<script setup>
import { ref, onMounted, provide } from 'vue'
import { auth } from '../firebaseResources'
import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '../firebaseResources'

import ModerationBanner from '../components/ModerationBanner.vue'
import UserStats from '../components/UserStats.vue'
import PostInput from '../components/PostInput.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'

const user = ref(null)
const bannedUntil = ref(null)
const feedKey = ref(0)

// Provide current user to child components like PostItem
provide('currentUser', user)

onMounted(() => {
  auth.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      const userRef = doc(firestore, 'users', firebaseUser.uid)
      const docSnap = await getDoc(userRef)

      if (docSnap.exists()) {
        const userData = docSnap.data()

        user.value = {
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          role: userData.role || 'user'
        }

        if (userData.bannedUntil) {
          bannedUntil.value = userData.bannedUntil.toDate()
        } else {
          bannedUntil.value = null
        }
      }
    } else {
      user.value = null
      bannedUntil.value = null
    }

    feedKey.value++ // refresh feed on auth change
  })
})

const reloadFeed = () => {
  feedKey.value++
}
</script>

<template>
  <div class="home-container">
    <aside class="left-panel" v-if="user">
      <UserStats :user="user" />
    </aside>

    <section class="main-feed">
      <ModerationBanner v-if="bannedUntil" :bannedUntil="bannedUntil" />
      <PostInput v-if="user" @post-created="reloadFeed" />
      <!--  FEED for logged-in user: shows followed posts only -->
      <PostFeed
  v-if="user"
  :key="`user-${feedKey}`"
  title="Feed"
/>

      <!--  Global feed for logged-out users -->
      <PostFeed
        v-else
        :key="`global-${feedKey}`"
        title="Global Feed"
      />
    </section>

    <aside class="right-panel">
      <SuggestedFollowers
  v-if="user"
  :currentUser="user"
  @user-followed="reloadFeed"
/>

      <SuggestedFollowers v-else :customList="[]" title="Suggested Users" />
    </aside>
  </div>
</template>

<style scoped>
.home-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1.5rem;
  background-color: #f9f9f9;
  padding: 2rem;
  box-sizing: border-box;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
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

@media (max-width: 900px) {
  .home-container {
    display: flex;
    flex-direction: column;
    padding: 1rem;
  }

  .left-panel,
  .right-panel,
  .main-feed {
    width: 100%;
  }
}
</style>
