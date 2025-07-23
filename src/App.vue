<script setup>
import { RouterView, useRouter } from 'vue-router'
import { provide, ref, onMounted, watch } from 'vue'
import { auth, firestore } from './firebaseResources'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import NavigationBar from './components/NavigationBar.vue'

// Load banned word list once from Firestore
import { loadBannedWordsOnce } from './utils/moderationUtils'

const router = useRouter()

// 👤 Track the current user and make it available globally
const currentUser = ref(null)
provide('currentUser', currentUser)

watch(currentUser, (val) => {
  console.log('📌 App.vue: currentUser updated:', val)
})

let unsubscribeUserSnapshot = null

onMounted(() => {
  loadBannedWordsOnce()

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
</script>

<template>
  <NavigationBar :user="currentUser" />
  <main>
    <RouterView />
  </main>
</template>

<style>
body {
  padding-top: 80px;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}
</style>

<style scoped>
main {
  padding: 2rem;
}
</style>
