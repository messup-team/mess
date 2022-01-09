<template>
  <div
    class="min-w-[70px] h-[50px] rounded p-2 bg-purple-300 hover:bg-purple-400 active:bg-purple-600 cursor-pointer flex justify-center items-center"
    @click="!disable ? $emit('press') : null"
    :class="{
      'opacity-75 bg-purple-300 hover:bg-purple-300 active:bg-purple-300 cursor-not-allowed':
        disable,
      blinking: highlight,
    }"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({ disable: Boolean, highlight: Boolean })
</script>

<style lang="postcss" scoped>
.blinking {
  border: 5px solid #9ae2ff;
  animation-name: blinking;
  animation-duration: 1s;
  animation-iteration-count: 100;
}
@keyframes blinking {
  50% {
    border-color: #ffcd5f;
  }
}
</style>
