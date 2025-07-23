<script setup>
import { RouterView, useRouter } from 'vue-router'
import { provide, ref, onMounted, watch } from 'vue'
import { auth, firestore } from './firebaseResources'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import NavigationBar from './components/NavigationBar.vue'

// 👉 NEW: Load moderation words
import { loadBannedWordsOnce } from './utils/moderationUtils'

const router = useRouter()

// 👤 currentUser
const currentUser = ref(null)
provide('currentUser', currentUser)

watch(currentUser, (val) => {
  console.log('📌 App.vue: currentUser updated:', val)
})

// ⛔ bannedWords loaded once
onMounted(() => {
  loadBannedWordsOnce() // ✅ fetch from Firestore and cache

  onAuthStateChanged(auth, (firebaseUser) => {
    if (unsubscribeUserSnapshot) {
      unsubscribeUserSnapshot()
      unsubscribeUserSnapshot = null
    }

    if (firebaseUser) {
      const userRef = doc(firestore, 'users', firebaseUser.uid)
      unsubscribeUserSnapshot = onSnapshot(userRef, (docSnap) => {
        if (!docSnap.exists()) {
          currentUser.value = null
          return
        }

        const userData = docSnap.data()
        currentUser.value = {
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          role: userData.role || 'user',
          bannedUntil: userData.bannedUntil?.toDate?.() || null
        }
      })
    } else {
      currentUser.value = null
      if (router.currentRoute.value.path !== '/') {
        router.push('/')
      }
    }
  })
})

// 🧹 unsubscribe cleanup
let unsubscribeUserSnapshot = null
</script>

<template>
  <NavigationBar />
  <main>
    <RouterView />
  </main>
</template>

<style>
body {
  padding-top: 80px;
}
</style>
<!-- Global styles -->
<style>
body {
  padding-top: 80px;
}
</style>

<style scoped>
main {
  padding: 2rem;
}
</style>
