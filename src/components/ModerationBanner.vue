<template>
  <div v-if="isBanned" class="banner">
    <p>
    You are banned from posting.
      <br />
      Time remaining: <strong>{{ timeRemaining }}</strong>
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  bannedUntil: Date
})

const isBanned = ref(false)
const timeRemaining = ref('')
let timer = null

function updateCountdown() {
  const now = new Date()
  const diff = props.bannedUntil - now

  if (diff <= 0) {
    isBanned.value = false
    timeRemaining.value = ''
    clearInterval(timer)
    return
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  timeRemaining.value = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

function pad(n) {
  return n.toString().padStart(2, '0')
}

watch(
  () => props.bannedUntil,
  (val) => {
    isBanned.value = val && new Date(val) > new Date()
    if (isBanned.value) {
      updateCountdown()
      clearInterval(timer)
      timer = setInterval(updateCountdown, 1000)
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.banner {
  background-color: #ffe6e6;
  color: #a30000;
  border: 1px solid #cc0000;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 6px;
  text-align: center;
}
</style>
