<template>
  <div class="w-full h-screen">
    <the-header />
    <router-view />
    <!-- <the-footer /> -->
  </div>
</template>

<script lang="ts" setup>
import TheHeader from '/src/layout/TheHeader.vue'
import TheFooter from '/src/layout/TheFooter.vue'
import { useStore } from 'vuex'

const store = useStore()

store.commit('initLocalstorage')
store.subscribe((mutation, state) => {
  const store = JSON.stringify(state)
  localStorage.setItem('mess-store', store)
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  width: 100%;
  height: 100%;
}
</style>
