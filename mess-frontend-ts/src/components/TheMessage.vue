<template>
  <div
    class="flex w-full"
    :class="message.from !== login ? 'justify-start' : 'justify-end'"
  >
    <div
      class="w-[300px] px-4 pt-4 pb-5 rounded-xl bg-blue-300 relative break-words"
      :class="{
        'bg-blue-200 rounded-bl-none': message.to === login,
        'bg-blue-100 rounded-br-none': message.from === login,
        'bg-red-200': message.unread,
      }"
    >
      {{ message.message }}
      <div class="text-[8px] absolute right-3 bottom-1">
        {{ message.from === login ? 'Me' : message.from }}
        {{ formatTimestamp(message.timestamp) }}
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
const props = defineProps({ message: { type: Object, required: true } })

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
