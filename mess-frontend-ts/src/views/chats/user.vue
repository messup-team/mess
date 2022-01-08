<template>
  <div class="flex flex-col p-3 pt-12 text-[16px] sm:pt-3 size">
    <div class="">
      <base-button @press="$router.push('/chats')" class="w-[70px]">
        &lt; Back
      </base-button>
      <div class="flex justify-center w-full mb-2">
        <span
          >Chat with <span class="text-red-300">{{ user }}</span></span
        >
      </div>
    </div>
    <div
      class="flex-grow order-last hidden px-2 space-y-2 overflow-y-scroll sm:block"
      ref="messagesElement"
    >
      <the-message v-for="message of messages" :key="message.id" :message="message" />
    </div>
    <!-- <div
      class="flex-grow order-last block px-2 space-y-2 overflow-y-scroll sm:hidden"
      ref="messagesElementReverse"
    >
      <the-message
        v-for="message of [...messages].reverse()"
        :key="message.id"
        :message="message"
      />
    </div> -->
    <div
      class="sm:absolute sm:bottom-1 sm:px-3 my-3 left-0 flex space-x-0.5 justify-center w-full"
    >
      <base-textarea
        v-model="message"
        class="flex-grow"
        placeholder="message..."
        @keyup.enter="onSend"
      />
      <base-button @press="onRead" :disable="inbox === 0"> Load new </base-button>
      <base-button @press="onSend"> Send </base-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'

import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

import TheMessage from '/src/components/TheMessage.vue'
import BaseButton from '/src/components/base/BaseButton.vue'
import BaseInput from '/src/components/base/BaseInput.vue'
import BaseTextarea from '/src/components/base/BaseTextarea.vue'
import { Chat } from '../../mess-api'

const store = useStore()
const router = useRouter()

const messagesElement = ref()
// const messagesElementReverse = ref()

function scroolMessagesBottom() {
  messagesElement.value.scrollTop = messagesElement.value.scrollHeight
  // messagesElementReverse.value.scrollTop = 0
}

function scroolMessagesBottomSlow() {
  messagesElement.value.scroll({
    top: messagesElement.value.scrollHeight,
    behavior: 'smooth',
  })
  // messagesElementReverse.value.scroll({
  //   top: 0,
  //   behavior: 'smooth',
  // })
}

onMounted(() => {
  setTimeout(scroolMessagesBottom, 0)
  setTimeout(scroolMessagesBottom, 100)
  setTimeout(scroolMessagesBottom, 200)
  setTimeout(scroolMessagesBottom, 300)
  setTimeout(scroolMessagesBottom, 400)
})

const props = defineProps({ user: String })

const message = ref('')
const messages = computed(() => store.getters.messages.messagesWith(props.user))
const inbox = computed(() => {
  const chats: Array<Chat> = store.getters.chats.chats
  console.log({ chats })
  for (const chat of chats) {
    if (chat.user === props.user) return chat.inbox
  }
  return 0
})
// const inbox = computed(() => store.getters.messages.inbox(props.user))

function onSend(event: any) {
  if (event?.ctrlKey) {
    message.value += '\n'
    return
  }
  message.value = message.value.slice(0, message.value.length - 1)
  if (message.value === '') return
  store.dispatch('sendMessage', {
    message: message.value,
    to: props.user,
  })
  message.value = ''
  setTimeout(scroolMessagesBottomSlow, 0)
  setTimeout(scroolMessagesBottomSlow, 1000)
}

function onRead() {
  console.log('read')
  store.dispatch('readMessages', props.user)
  setTimeout(scroolMessagesBottomSlow, 0)
  setTimeout(scroolMessagesBottomSlow, 1000)
}
</script>

<style>
.size {
  height: calc(100vh - 140px);
}
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: #b3afb3;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #b3afb3;
}
::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 0px;
  box-shadow: inset 0px 0px 0px 0px #f0f0f0;
}
</style>
