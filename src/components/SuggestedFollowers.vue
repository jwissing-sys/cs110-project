<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
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
  if (props.customList.length) {
    suggestions.value = props.customList
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

function follow(user) {
  alert(`Followed ${user.email} (mock)`)
}
</script>

<template>
  <div class="suggested-followers">
    <h3>{{ title }}</h3>
    <ul>
      <li v-for="user in suggestions" :key="user.email">
        <RouterLink :to="`/users/${user.id}`">{{ user.email }}</RouterLink>
        <button v-if="currentUser" @click="follow(user)">Follow</button>
      </li>
    </ul>
    <p v-if="suggestions.length === 0">No one to follow</p>
  </div>
</template>

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
  padding: 0.25rem 0.75rem;
  font-size: 0.9rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #e5e5e5;
  cursor: pointer;
}
</style>
