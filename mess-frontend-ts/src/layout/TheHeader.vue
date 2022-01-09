<template>
  <div class="h-[50px] flex justify-center items-center w-full relative py-10">
    <h1 class="hidden sm:block">
      <span class="text-blue-400">Mess</span>enger for everyone and everywhere
    </h1>
    <h1 class="text-sm sm:hidden"><span class="text-blue-400">Mess</span>enger</h1>
    <div class="absolute right-3">
      <base-button @click="onLogin"> {{ loginLabel }} </base-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

import BaseButton from '/src/components/base/BaseButton.vue'

const store = useStore()
const router = useRouter()

const isLogin = computed(() => store.getters.auth.isLogin)

const loginLabel = computed(() => (isLogin.value ? store.getters.auth.login : 'Log in'))

function onLogin() {
  if (isLogin.value) {
    store.dispatch('userLogout')
  }
  router.push('/login')
}
</script>
