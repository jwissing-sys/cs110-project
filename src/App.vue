<script setup>
import { RouterView } from 'vue-router'
import { provide, ref, onMounted } from 'vue'
import { auth, firestore } from './firebaseResources'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import NavigationBar from './components/NavigationBar.vue'

const currentUser = ref(null)
provide('currentUser', currentUser)

onMounted(() => {
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userRef = doc(firestore, 'users', firebaseUser.uid)
      const docSnap = await getDoc(userRef)

      if (docSnap.exists()) {
        const userData = docSnap.data()
        currentUser.value = {
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          role: userData.role || 'user',
          bannedUntil: userData.bannedUntil?.toDate?.() || null
        }
      } else {
        currentUser.value = {
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          role: 'user',
          bannedUntil: null
        }
      }
    } else {
      currentUser.value = null
    }
  })
})
</script>

<template>
  <NavigationBar />
  <main>
    <RouterView />
  </main>
</template>

<!-- Global styles must not be scoped -->
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
