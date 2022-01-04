import { createWebHistory, createRouter } from 'vue-router'

import home from '/src/views/home.vue'
import login from '/src/views/login.vue'
import chats from '/src/views/chats/index.vue'
import chatsUser from '/src/views/chats/user.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: home,
  },
  {
    path: '/login',
    name: 'Login',
    component: login,
  },
  {
    path: '/chats',
    name: 'chats',
    component: chats,
  },
  {
    path: '/chats/:user',
    name: 'messages',
    component: chatsUser,
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
