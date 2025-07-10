<template>
  <div class="profile-view">
    <aside class="left-panel">
      <UserStats :user="viewedUser" />
    </aside>

    <section class="main-feed">
      <h2>Posts by {{ viewedUser?.email }}</h2>
      <PostFeed :posts="viewedPosts" />
    </section>

    <aside class="right-panel">
      <SuggestedFollowers
        :currentUser="null"
        :customList="[viewedUser]"
        :title="`Follow ${viewedUser?.email}`"
      />
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import UserStats from '../components/UserStats.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'

const route = useRoute()
const userId = route.params.id

// Mocked user document for viewing another user's profile
const viewedUser = ref({
  id: userId,
  email: `${userId}@example.com`,
  followers: ['mock'],
  following: [],
  posts: ['postA', 'postB']
})

// Mocked posts by that user
const viewedPosts = ref([
  {
    id: 1,
    author: viewedUser.value.email,
    content: 'Post from viewed user 1',
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    author: viewedUser.value.email,
    content: 'Post from viewed user 2',
    timestamp: new Date().toISOString()
  }
])
</script>

<style scoped>
.profile-view {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.left-panel,
.right-panel {
  width: 20%;
}

.main-feed {
  width: 60%;
}
</style>
