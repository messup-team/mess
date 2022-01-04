<template>
  <div class="flex items-center justify-center w-full">
    <span>login to use the app</span>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()
onMounted(() => {
  if (store.getters.auth.isLogin) router.push('/chats')
})
</script>
