<script setup>
import { ref, onMounted } from 'vue'
import { auth } from '../firebaseResources'

import UserStats from '../components/UserStats.vue'
import PostInput from '../components/PostInput.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'

const user = ref(null)
const feedKey = ref(0)

onMounted(() => {
  auth.onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      user.value = {
        email: firebaseUser.email,
        uid: firebaseUser.uid
      }
    } else {
      user.value = null
    }
    feedKey.value++ // always refresh feed after auth change
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
      <PostInput v-if="user" @post-created="reloadFeed" />

      <!--  FEED for logged-in user: shows followed posts only -->
      <PostFeed
        v-if="user"
        :userId="user.uid"
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
      <SuggestedFollowers v-if="user" :currentUser="user" />
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
