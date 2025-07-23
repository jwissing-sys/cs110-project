import { createRouter, createWebHistory } from 'vue-router'
import { auth, firestore } from '../firebaseResources'
import { doc, getDoc } from 'firebase/firestore'

import HomeView from '../views/HomeView.vue'
import ModerationDashboard from '../views/ModerationDashboard.vue'
import FlaggedPostsReview from '../views/FlaggedPostsReview.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/flagged-posts-review',
      name: 'FlaggedPostsReview',
      component: FlaggedPostsReview,
      meta: { requiresRole: ['reviewer', 'admin'] }
    },
    {
      path: '/moderation-dashboard',
      name: 'ModerationDashboard',
      component: ModerationDashboard,
      meta: { requiresRole: ['admin'] }
    },
    {
      path: '/users/:id',
      name: 'profile',
      component: () => import('../views/UserProfileView.vue'),
      props: true
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/'
    }
  ]
})

// Helper to wait for Firebase Auth to load
function waitForAuthReady() {
  return new Promise(resolve => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe()
      resolve(user)
    })
  })
}

// Global route guard for role-based access
router.beforeEach(async (to, from, next) => {
  const requiredRoles = to.meta.requiresRole
  const user = await waitForAuthReady()

  // No user at all? Block role-restricted pages
  if (!user) {
    return requiredRoles ? next('/login') : next()
  }

  // Fetch Firestore user document
  const userDoc = await getDoc(doc(firestore, 'users', user.uid))
  const userData = userDoc.exists() ? userDoc.data() : {}

  // Ban check
  const bannedUntil = userData.bannedUntil?.toDate?.()
  const now = new Date()
  const isBanned = bannedUntil && bannedUntil > now

  if (isBanned && to.path !== '/' && to.path !== '/login') {
    return next('/') // Force redirect banned users
  }

  // Role check
  const userRole = userData.role || 'user'
  if (requiredRoles && !requiredRoles.includes(userRole)) {
    return next('/') // Redirect if role doesn't match
  }

  next()
})


export default router
