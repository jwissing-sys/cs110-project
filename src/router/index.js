import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

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
      path: '/users/:id',
      name: 'profile',
      component: () => import('../views/UserProfileView.vue'),
      props: true  // 
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/'  //
    }
  ]
})

export default router
