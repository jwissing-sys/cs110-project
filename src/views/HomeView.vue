<script setup>
import { ref } from 'vue'

import UserStats from '../components/UserStats.vue'
import PostInput from '../components/PostInput.vue'
import PostFeed from '../components/PostFeed.vue'
import SuggestedFollowers from '../components/SuggestedFollowers.vue'

// Mocked user
const user = ref({
  email: 'user@example.com',
  followers: ['a', 'b'],
  following: ['x'],
  posts: ['post1']
})

// Mocked posts
const posts = ref([
  {
    id: 1,
    author: 'user@example.com',
    content: 'Hello world!',
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    author: 'guest@abc.com',
    content: 'This is a second post.',
    timestamp: new Date().toISOString()
  }
])

function addPost(newContent) {
  posts.value.unshift({
    id: Date.now(),
    author: user.value.email,
    content: newContent,
    timestamp: new Date().toISOString()
  })
}
</script>

<template>
  <div class="home-container">
    <aside class="left-panel">
      <UserStats :user="user" />
    </aside>

    <section class="main-feed">
      <PostInput v-if="user" @post="addPost" />
      <PostFeed :posts="posts" />
    </section>

    <aside class="right-panel">
      <SuggestedFollowers :currentUser="user" />
    </aside>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  background-color: #f9f9f9;
  padding: 2rem;
  box-sizing: border-box;

  max-width: 1200px;
  margin: 0 auto; /* center on large screens */
  min-height: 100vh;
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
  min-width: 0; /* prevents overflow */
  background-color: #ffffff;
  border: 1px solid #ddd;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

@media (max-width: 900px) {
  .home-container {
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
