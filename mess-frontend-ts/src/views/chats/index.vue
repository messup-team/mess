<template>
  <div class="p-2 space-y-2">
    <the-chat
      v-for="user of chats"
      :key="user"
      :user="user"
      @click="() => onSelect(user)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import TheChat from '/src/components/TheChat.vue'

const store = useStore()
const router = useRouter()

function onSelect(user: string) {
  router.push(`/chats/${user}`)
}

const chats = computed(() => store.getters.messages.chats)
</script>
