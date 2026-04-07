<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon :size="32" color="#409eff"><Promotion /></el-icon>
        <span class="logo-text">营销AI智能体</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        
        <el-menu-item index="/tasks">
          <el-icon><List /></el-icon>
          <span>营销任务</span>
        </el-menu-item>
        
        <el-menu-item index="/creatives">
          <el-icon><MagicStick /></el-icon>
          <span>创意工坊</span>
        </el-menu-item>
        
        <el-menu-item index="/analytics">
          <el-icon><TrendCharts /></el-icon>
          <span>效果分析</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <breadcrumb />
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="userAvatar" />
              <span class="username">{{ userName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>系统设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Odometer,
  List,
  MagicStick,
  TrendCharts,
  ArrowDown,
  User,
  Setting,
  SwitchButton,
  Promotion,
} from '@element-plus/icons-vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const route = useRoute()
const router = useRouter()

// 当前激活的菜单
const activeMenu = computed(() => {
  const { path } = route
  return path
})

// 用户信息
const userData = ref<any>({})

onMounted(() => {
  // 从 localStorage 获取用户信息
  const userStr = localStorage.getItem('auth_user')
  if (userStr) {
    try {
      userData.value = JSON.parse(userStr)
    } catch (e) {
      console.error('解析用户信息失败', e)
    }
  }
})

const userName = computed(() => {
  return userData.value?.name || userData.value?.nickname || '用户'
})

const userAvatar = computed(() => {
  return userData.value?.picture || ''
})

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      ElMessage.info('系统设置功能开发中')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 清除本地存储的token
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('refresh_token')
    
    ElMessage.success('已退出登录')
    
    // 跳转到登录页
    router.push('/auth/login')
  }).catch(() => {
    // 取消退出
  })
}
</script>

<style scoped lang="scss">
@use '@/styles/digital-command-center.scss' as dcc;

.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: row;
  background: var(--dcc-bg-primary);
}

.sidebar {
  background: hsla(222 47% 8% / 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--dcc-border-color);
  transition: width 0.3s;
  
  :deep(.el-menu) {
    background: transparent;
    border-right: none;
    
    .el-menu-item {
      color: var(--dcc-text-secondary);
      
      &:hover {
        background: hsla(190 100% 50% / 0.1);
        color: var(--dcc-accent-cyan);
      }
      
      &.is-active {
        background: hsla(190 100% 50% / 0.15);
        color: var(--dcc-accent-cyan);
        border-right: 3px solid var(--dcc-accent-cyan);
      }
    }
  }
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-bottom: 1px solid var(--dcc-border-color);

  .logo-text {
    background: var(--dcc-gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
}

.sidebar-menu {
  border-right: none;
}

.main-container {
  background: var(--dcc-bg-primary);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  background: hsla(222 47% 12% / 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--dcc-border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--dcc-spacing-lg);
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--dcc-spacing-sm);
  cursor: pointer;
  padding: var(--dcc-spacing-sm);
  border-radius: var(--dcc-radius-md);
  transition: all 0.3s;
  background: hsla(222 47% 16% / 0.5);
  border: 1px solid var(--dcc-border-color);

  &:hover {
    background: hsla(190 100% 50% / 0.1);
    border-color: var(--dcc-accent-cyan);
  }

  .username {
    font-size: var(--dcc-font-size-sm);
    color: var(--dcc-text-primary);
    font-weight: 500;
  }
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: var(--dcc-bg-primary);
  background-image: 
    radial-gradient(ellipse at 20% 20%, hsla(280 60% 50% / 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, hsla(190 80% 50% / 0.04) 0%, transparent 50%);
}

/* 页面切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
