<script setup>
import { ref, watchEffect } from 'vue'
import { RouterLink } from 'vue-router'
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
const loadingIds = ref(new Set())

const loadSuggestions = async () => {
  // If custom list passed (e.g. in profile), use that directly
  if (props.customList.length) {
    suggestions.value = props.customList.map((u) => ({ ...u, followed: true }))
    return
  }

  // If user is logged out or no currentUser, show anonymous suggestions
  if (!props.currentUser) {
    const allUsersSnap = await getDocs(collection(firestore, 'users'))
    const users = allUsersSnap.docs.map(snap => ({
      uid: snap.id,
      email: snap.data().email,
      followed: false
    }))
    suggestions.value = users.sort(() => 0.5 - Math.random()).slice(0, 5)
    return
  }

  // Logged in: show users they are not following yet
  const currentUserId = props.currentUser.uid
  const userSnap = await getDoc(doc(firestore, 'users', currentUserId))
  const currentData = userSnap.data()
  following.value = new Set(currentData?.following || [])

  const allUsersSnap = await getDocs(collection(firestore, 'users'))
  const candidates = []

  allUsersSnap.forEach((snap) => {
    const uid = snap.id
    const userData = snap.data()
    if (uid !== currentUserId && !following.value.has(uid)) {
      candidates.push({
        uid,
        email: userData.email
      })
    }
  })

  suggestions.value = candidates.sort(() => 0.5 - Math.random()).slice(0, 5)
}

watchEffect(() => {
  loadSuggestions()
})

const follow = async (target) => {
  if (!props.currentUser) return

  const targetUserId = target.uid
  loadingIds.value.add(targetUserId)

  try {
    const currentUserId = props.currentUser.uid
    const currentRef = doc(firestore, 'users', currentUserId)
    const targetRef = doc(firestore, 'users', targetUserId)

    const [currentSnap, targetSnap] = await Promise.all([
      getDoc(currentRef),
      getDoc(targetRef)
    ])

    if (!currentSnap.exists() || !targetSnap.exists()) return

    const currentData = currentSnap.data()
    const targetData = targetSnap.data()

    const updatedFollowing = new Set(currentData.following || [])
    const updatedFeed = new Set(currentData.feed || [])
    const updatedFollowers = new Set(targetData.followers || [])

    updatedFollowing.add(targetUserId)
    updatedFollowers.add(currentUserId)

    for (const postId of targetData.posts || []) {
      updatedFeed.add(postId)
    }

    await Promise.all([
      updateDoc(currentRef, {
        following: Array.from(updatedFollowing),
        feed: Array.from(updatedFeed)
      }),
      updateDoc(targetRef, {
        followers: Array.from(updatedFollowers)
      })
    ])

    await loadSuggestions()

  } catch (err) {
    console.error('Error following user:', err)
  } finally {
    loadingIds.value.delete(targetUserId)
  }
}
</script>

<template>
  <div class="suggested-followers">
    <h3>{{ title }}</h3>
    <ul v-if="suggestions.length">
      <li v-for="user in suggestions" :key="user.uid">
        <RouterLink :to="`/users/${user.uid}`">{{ user.email }}</RouterLink>
        <button
          v-if="!user.followed"
          @click="follow(user)"
          :disabled="loadingIds.has(user.uid)"
        >
          {{ loadingIds.has(user.uid) ? 'Following...' : 'Follow' }}
        </button>
        <span v-else>Followed</span>
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
