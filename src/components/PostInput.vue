<template>
  <div class="post-input">
    <h3>Create a Post</h3>
    <form @submit.prevent="submitPost">
      <textarea v-model.trim="content" placeholder="What's on your mind?" required></textarea>
      <button type="submit" :disabled="!content">Post</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const content = ref('')
const emit = defineEmits(['post'])

function submitPost() {
  if (!content.value) return
  emit('post', content.value)
  content.value = ''
}
</script>

<style scoped>
.post-input {
  margin-bottom: 1.5rem;
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 6px;
  background: #fff;
}
form {
  display: flex;
  flex-direction: column;
}
textarea {
  width: 100%;
  height: 80px;
  margin-bottom: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
}
</style>
