<template>
  <div class="flex flex-col p-3 pt-12 text-[16px] sm:pt-3 size">
    <div class="">
      <base-button @click="$router.push('/chats')" class="w-[70px]">
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
      <the-message
        v-for="message of messages"
        :key="message.timestamp"
        :message="message"
      />
    </div>
    <div
      class="flex-grow order-last block px-2 space-y-2 overflow-y-scroll sm:hidden"
      ref="messagesElementReverse"
    >
      <the-message
        v-for="message of [...messages].reverse()"
        :key="message.timestamp"
        :message="message"
      />
    </div>
    <div
      class="sm:absolute sm:bottom-1 sm:px-3 my-3 left-0 flex space-x-0.5 justify-center w-full"
    >
      <base-input
        v-model="message"
        class="flex-grow"
        placeholder="message..."
        @keyup.enter="onSend"
      />
      <base-button @click="onSend"> Send </base-button>
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

const store = useStore()
const router = useRouter()

const messagesElement = ref()
const messagesElementReverse = ref()

function scroolMessagesBottom() {
  messagesElement.value.scrollTop = messagesElement.value.scrollHeight
  messagesElementReverse.value.scrollTop = 0
}

function scroolMessagesBottomSlow() {
  messagesElement.value.scroll({
    top: messagesElement.value.scrollHeight,
    behavior: 'smooth',
  })
  messagesElementReverse.value.scroll({
    top: 0,
    behavior: 'smooth',
  })
}

onMounted(() => {
  scroolMessagesBottom()

  // read messages
  store.dispatch('readMessagesFrom', props.user)
})

const props = defineProps({ user: String })

const message = ref('')
// element.scrollTop = element.scrollHeight
const messages = computed(() => store.getters.messages.messagesWith(props.user))

function onSend() {
  if (message.value === '') return
  store.dispatch('sendMessage', {
    message: message.value,
    to: props.user,
  })
  message.value = ''
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
