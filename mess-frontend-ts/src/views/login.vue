<template>
  <div class="">
    <login-form @login="onLogin" placeholder="username..." />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import LoginForm from '/src/components/LoginForm.vue'

const store = useStore()
const router = useRouter()

onMounted(() => {
  if (store.getters.auth.isLogin) router.push('/')
})

function onLogin(login: string) {
  try {
    store.dispatch('userLogin', login)
    router.push('/chats')
  } catch (e) {
    console.error(e)
  }
}
</script>
