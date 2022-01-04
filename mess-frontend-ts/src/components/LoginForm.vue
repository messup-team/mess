<template>
  <div class="flex items-center justify-center w-full px-3">
    <div
      class="max-w-[600px] rounded border-green-400 border-2 flex-grow h-[300px] bg-green-300 flex justify-center items-center"
    >
      <base-input
        v-model="login"
        type="text"
        :placeholder="placeholder"
        @keyup.enter="onClick"
        class="mr-1 bg-blue-200"
      />
      <base-button @click="onClick"> Login </base-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import BaseButton from '/src/components/base/BaseButton.vue'
import BaseInput from '/src/components/base/BaseInput.vue'

const props = defineProps({ placeholder: String })
const emit = defineEmits(['login'])

const warning = ref('')
const login = ref('')

function onClick() {
  if (login.value !== '') emit('login', login.value)
  else alert('Login cant be empty')
}
</script>
