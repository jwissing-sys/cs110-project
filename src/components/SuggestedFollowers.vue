<script setup>
defineProps({
  currentUser: Object,
  customList: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Suggested Users'
  }
})

const suggestions = ref([])

onMounted(() => {
  // If a custom list is provided (e.g. profile view), use it instead
  if (customList.length) {
    suggestions.value = customList
  } else {
    suggestions.value = [
      { id: 'u1', email: 'alice@example.com' },
      { id: 'u2', email: 'bob@example.com' },
      { id: 'u3', email: 'carol@example.com' },
      { id: 'u4', email: 'dave@example.com' },
      { id: 'u5', email: 'eve@example.com' }
    ]
  }
})
</script>


<template>
  <div class="suggested-followers">
    <h3>
      {{ title }}
    </h3>
    <ul>
      <li v-for="user in suggestions" :key="user.email">
        <RouterLink :to="`/users/${user.id}`">{{ user.email }}</RouterLink>
        <button v-if="currentUser" @click="follow(user)">Follow</button>
      </li>
    </ul>
    <p v-if="suggestions.length === 0">No one to follow</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

defineProps({
  currentUser: Object
})

const title = ref('Suggested Users')

// Hardcoded mock users (excluding currentUser + people they follow)
const suggestions = ref([
  { id: 'u1', email: 'alice@example.com' },
  { id: 'u2', email: 'bob@example.com' },
  { id: 'u3', email: 'carol@example.com' },
  { id: 'u4', email: 'dave@example.com' },
  { id: 'u5', email: 'eve@example.com' }
])

function follow(user) {
  alert(`Followed ${user.email} (mock)`)
  // In Assignment 4, this will update Firestore
}
</script>

<style scoped>
.suggested-followers {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 6px;
  background: #f4f4f4;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
button {
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
}
</style>
