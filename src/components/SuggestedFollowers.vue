<script setup>
import { ref, onMounted } from 'vue'
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

onMounted(async () => {
  if (!props.currentUser?.uid) return

  const allUsersSnap = await getDocs(collection(firestore, 'users'))
  const allUsers = []
  const currentUserId = props.currentUser.uid

  const currentUserDoc = await getDoc(doc(firestore, 'users', currentUserId))
  const currentData = currentUserDoc.data()
  const followingList = currentData?.following || []

  allUsersSnap.forEach((docSnap) => {
    const userData = docSnap.data()
    const uid = docSnap.id

    if (
      uid !== currentUserId &&
      !followingList.includes(uid)
    ) {
      allUsers.push({ uid, email: userData.email })
    }
  })

  // Shuffle and take 5
  suggestions.value = allUsers
    .sort(() => 0.5 - Math.random())
    .slice(0, 5)
})


const follow = async (target) => {
  const currentUserId = props.currentUser.uid
  const targetUserId = target.uid

  const currentRef = doc(firestore, 'users', currentUserId)
  const targetRef = doc(firestore, 'users', targetUserId)

  const [currentSnap, targetSnap] = await Promise.all([
    getDoc(currentRef),
    getDoc(targetRef)
  ])

  const currentData = currentSnap.data()
  const targetData = targetSnap.data()

  const currentFollowing = new Set(currentData.following || [])
  const targetFollowers = new Set(targetData.followers || [])
  const targetPosts = targetData.posts || []

  currentFollowing.add(targetUserId)
  targetFollowers.add(currentUserId)

  await updateDoc(currentRef, {
    following: Array.from(currentFollowing),
    feed: [...(currentData.feed || []), ...targetPosts]
  })

  await updateDoc(targetRef, {
    followers: Array.from(targetFollowers)
  })

  // Remove from suggestion list after follow
  suggestions.value = suggestions.value.filter(u => u.uid !== targetUserId)
}

</script>

<template>
  <div class="suggested-followers">
    <h3>Suggested Users</h3>
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
