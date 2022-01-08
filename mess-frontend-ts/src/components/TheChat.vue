<template>
  <div
    class="w-full h-[50px] flex justify-between items-center border-fuchsia-300 border-2 rounded p-10 bg-fuchsia-200 hover:bg-fuchsia-300 cursor-pointer"
  >
    <div>
      {{ user }}
    </div>
    <div
      class="w-[20px] h-[20px] flex justify-center items-center rounded-full bg-red-400 text-white text-[10px]"
    >
      {{ inbox }}
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({ user: String, inbox: Number })
</script>
