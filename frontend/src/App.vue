<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 使用路由视图来显示页面
</script>

<style scoped>
#app {
  width: 100%;
  height: 100%;
  min-height: 100vh;
}
</style>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
