<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
      <span v-if="index === breadcrumbs.length - 1" class="no-redirect">{{ item.title }}</span>
      <a v-else @click.prevent="handleLink(item)">{{ item.title }}</a>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteLocationMatched } from 'vue-router'

interface Breadcrumb {
  path: string
  title: string
}

const route = useRoute()
const router = useRouter()
const breadcrumbs = ref<Breadcrumb[]>([])

// 获取面包屑
const getBreadcrumbs = () => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  
  breadcrumbs.value = matched.map(item => ({
    path: item.path,
    title: item.meta.title as string,
  }))
}

// 处理链接点击
const handleLink = (item: Breadcrumb) => {
  router.push(item.path)
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    getBreadcrumbs()
  },
  { immediate: true }
)
</script>

<style scoped>
.no-redirect {
  color: #97a8be;
  cursor: text;
}

a {
  color: #606266;
  cursor: pointer;
  
  &:hover {
    color: #409eff;
  }
}
</style>
