<template>
  <input
    v-model="input"
    :placeholder="placeholder"
    class="bg-gray-50 border-2 rounded border-red-100 h-[50px] p-2"
    type="text"
  />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps({ placeholder: String, modelValue: String })
const emit = defineEmits(['update:modelValue'])

const input = ref('')

watch(input, (newValue) => {
  emit('update:modelValue', newValue)
})

watch(
  () => props.modelValue,
  (newValue) => {
    input.value = newValue as string
  }
)
</script>
