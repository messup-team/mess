<template>
  <div
    class="flex w-full"
    :class="message.from !== login ? 'justify-start' : 'justify-end'"
  >
    <div
      class="relative px-4 pt-4 pb-5 break-words bg-blue-300 rounded-xl"
      :class="{
        'bg-blue-200 rounded-bl-none': message.to === login,
        'bg-blue-100 rounded-br-none': message.from === login,
        'bg-red-200': message.unread,
        'w-[300px]': !special,
        'w-full text-center bg-purple-300': special,
      }"
    >
      {{ message.body }}
      <div class="text-[8px] absolute right-3 bottom-1" v-if="!special">
        {{ message.from === login ? 'Me' : message.from }}
        {{ message.timestamp >= 0 ? formatTimestamp(message.timestamp) : '' }}
        {{ iconOfStatus(message.status) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { MessageStatus, utils } from '../mess-api'

const store = useStore()

const login = computed(() => store.getters.auth.login)
const props = defineProps({
  message: { type: Object, required: true },
  special: Boolean,
})

function iconOfStatus(status: MessageStatus) {
  switch (status) {
    case 'OK':
      return '✓'
    case 'PROCESS':
      return '...'
    case 'FAILED':
      return '✕'
  }
}

const formatTimestamp = utils.formatTimestamp
</script>
