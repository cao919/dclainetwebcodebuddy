<template>
  <div class="callback-view">
    <div class="loading-container">
      <el-icon class="loading-icon" :size="48" color="#409eff"><Loading /></el-icon>
      <p class="loading-text">正在处理登录...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const router = useRouter()
const { handleRedirectCallback, isAuthenticated } = useAuth0()

// 默认跳转路径
const defaultRedirect = '/dashboard'

onMounted(async () => {
  try {
    // 处理 Auth0 回调
    const result = await handleRedirectCallback()
    
    // 获取跳转目标，默认为仪表盘
    const targetUrl = result?.appState?.targetUrl || defaultRedirect
    
    ElMessage.success('登录成功')
    router.push(targetUrl)
  } catch (error) {
    console.error('Auth0 回调处理失败:', error)
    ElMessage.error('登录失败，请重试')
    router.push('/auth/login')
  }
})
</script>

<style scoped>
.callback-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-container {
  text-align: center;
  color: #fff;
}

.loading-icon {
  animation: rotate 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 16px;
  margin: 0;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
