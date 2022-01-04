<template>
  <div
    class="min-w-[70px] h-[50px] rounded p-2 bg-purple-300 hover:bg-purple-400 active:bg-purple-600 cursor-pointer flex justify-center items-center"
    @click="$emit('click')"
  >
    <slot />
  </div>
</template>
