<template>
  <div class="p-2 space-y-2">
    <div class="flex w-full space-x-0.5">
      <base-input
        v-model="searchQuery"
        class="flex-grow"
        @keyup.enter="() => onNewChat(false)"
      />
      <base-button @click="() => onNewChat(true)"> WRITE </base-button>
    </div>
    <the-chat
      v-for="{ user, inbox } of chats"
      :key="user"
      :user="user"
      :inbox="inbox"
      @click="() => onSelect(user)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Chat } from '../../mess-api'

import TheChat from '/src/components/TheChat.vue'
import BaseInput from '/src/components/base/BaseInput.vue'
import BaseButton from '/src/components/base/BaseButton.vue'

const store = useStore()
const router = useRouter()

const searchQuery = ref('')

function onSelect(user: string) {
  store.dispatch('watchMessages', user)
  router.push(`/chats/${user}`)
}

function onNewChat(always: boolean) {
  if (chats.value.length === 0 || always) {
    router.push(`/chats/${searchQuery.value.toLowerCase()}`)
    return
  } else {
    router.push(`/chats/${chats.value[0]}`)
  }
}

const chats = computed(() => {
  if (searchQuery.value === '') return store.getters.chats.chats
  return store.getters.chats.chats.filter((chat: Chat) =>
    chat.user.toLowerCase().startsWith(searchQuery.value.toLowerCase())
  )
})
</script>
