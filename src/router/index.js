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
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/flagged-posts-review',
      name: 'FlaggedPostsReview',
      component: FlaggedPostsReview,
      beforeEnter: async (to, from, next) => {
        const user = auth.currentUser
        if (!user) return next('/login')

        const ref = doc(firestore, 'users', user.uid)
        const snap = await getDoc(ref)
        const role = snap.exists() ? snap.data().role : 'user'

        role === 'reviewer' || role === 'admin' ? next() : next('/')
      }
    },
    {
      path: '/moderation-dashboard',
      name: 'ModerationDashboard',
      component: ModerationDashboard,
      beforeEnter: async (to, from, next) => {
        const user = auth.currentUser
        if (!user) return next('/login')

        const ref = doc(firestore, 'users', user.uid)
        const snap = await getDoc(ref)
        const role = snap.exists() ? snap.data().role : 'user'

        role === 'admin' ? next() : next('/')
      }
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

export default router
