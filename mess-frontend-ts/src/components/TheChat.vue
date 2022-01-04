<template>
  <div
    class="w-full h-[50px] flex items-center border-fuchsia-300 border-2 rounded p-10 bg-fuchsia-200 hover:bg-fuchsia-300 cursor-pointer"
  >
    {{ user }}
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({ user: String })
</script>
