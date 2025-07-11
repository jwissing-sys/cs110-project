<script setup>
import { ref, watchEffect } from 'vue'
import { firestore } from '../firebaseResources'
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore'

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
const following = ref(new Set())

watchEffect(async () => {
  if (!props.currentUser) {
    suggestions.value = []
    return
  }

  if (props.customList.length) {
    suggestions.value = props.customList
    return
  }

  const currentUserId = props.currentUser.uid
  const userSnap = await getDoc(doc(firestore, 'users', currentUserId))
  const currentData = userSnap.data()
  following.value = new Set(currentData?.following || [])

  const allUsersSnap = await getDocs(collection(firestore, 'users'))
  const users = []

  allUsersSnap.forEach((snap) => {
    const uid = snap.id
    const userData = snap.data()
    if (uid !== currentUserId && !following.value.has(uid)) {
      users.push({ uid, email: userData.email })
    }
  })

  suggestions.value = users.sort(() => 0.5 - Math.random()).slice(0, 5)
})

const follow = async (target) => {
  if (!props.currentUser) return

  const currentUserId = props.currentUser.uid
  const targetUserId = target.uid

  const [currentRef, targetRef] = [
    doc(firestore, 'users', currentUserId),
    doc(firestore, 'users', targetUserId)
  ]

  const [currentSnap, targetSnap] = await Promise.all([
    getDoc(currentRef),
    getDoc(targetRef)
  ])

  const currentData = currentSnap.data()
  const targetData = targetSnap.data()

  const updatedFollowing = new Set(currentData.following || [])
  const updatedFollowers = new Set(targetData.followers || [])
  const targetPosts = targetData.posts || []

  updatedFollowing.add(targetUserId)
  updatedFollowers.add(currentUserId)

  await Promise.all([
    updateDoc(currentRef, {
      following: Array.from(updatedFollowing),
      feed: [...(currentData.feed || []), ...targetPosts]
    }),
    updateDoc(targetRef, {
      followers: Array.from(updatedFollowers)
    })
  ])

  // Remove followed user from suggestions list
  suggestions.value = suggestions.value.filter(u => u.uid !== targetUserId)
}
</script>

<template>
  <div class="suggested-followers">
    <h3>{{ title }}</h3>
    <ul v-if="suggestions.length">
      <li v-for="user in suggestions" :key="user.uid">
        {{ user.email }}
        <button @click="follow(user)">Follow</button>
      </li>
    </ul>
    <p v-else>No one new to follow</p>
  </div>
</template>

<style scoped>
.suggested-followers {
  padding: 1rem;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin: 0.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
button {
  padding: 0.3rem 0.6rem;
}
</style>
