<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // 初始化时检查认证状态
  authStore.checkAuth()
})
</script>

<style scoped>
#app {
  width: 100%;
  height: 100%;
  min-height: 100vh;
}
</style>