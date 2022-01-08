<template>
  <div
    class="min-w-[70px] h-[50px] rounded p-2 bg-purple-300 hover:bg-purple-400 active:bg-purple-600 cursor-pointer flex justify-center items-center"
    @click="!disable ? $emit('press') : null"
    :class="{
      'opacity-75 bg-purple-300 hover:bg-purple-300 active:bg-purple-300 cursor-not-allowed':
        disable,
    }"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({ disable: Boolean })
</script>
