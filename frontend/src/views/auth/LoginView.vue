<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-header">
        <div class="logo">
          <el-icon :size="48" color="#409eff"><Promotion /></el-icon>
        </div>
        <h1>营销AI智能体系统</h1>
        <p class="subtitle">AI驱动的全流程营销自动化平台</p>
      </div>

      <el-card class="login-card" shadow="hover">
        <el-tabs v-model="activeTab" stretch>
          <!-- 本地登录（开发测试用） -->
          <el-tab-pane label="本地登录" name="local">
            <el-form
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
              class="login-form"
            >
              <el-form-item prop="email">
                <el-input
                  v-model="loginForm.email"
                  placeholder="邮箱"
                  size="large"
                  :prefix-icon="Message"
                  @keyup.enter="handleLocalLogin"
                />
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="密码"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                  @keyup.enter="handleLocalLogin"
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  class="login-btn"
                  :loading="localLoading"
                  @click="handleLocalLogin"
                >
                  登录
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- Auth0 登录 -->
          <el-tab-pane label="Auth0 登录" name="auth0">
            <div class="auth-section">
              <p class="auth-description">使用 Auth0 安全认证服务登录</p>
              <el-alert
                title="Auth0 暂未配置"
                description="请使用本地登录方式进行测试"
                type="info"
                :closable="false"
              />
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="login-footer">
          <el-divider>其他方式</el-divider>
          <div class="social-login">
            <el-button circle size="large" @click="handleWechatLogin">
              <el-icon><ChatDotRound /></el-icon>
            </el-button>
            <el-button circle size="large" @click="handleGithubLogin">
              <svg viewBox="0 0 24 24" width="20" height="20" style="fill: currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </el-button>
          </div>
        </div>
      </el-card>

      <div class="login-features">
        <el-row :gutter="40">
          <el-col :span="8">
            <div class="feature-item">
              <el-icon :size="32" color="#409eff"><DataAnalysis /></el-icon>
              <h4>智能分析</h4>
              <p>AI驱动的市场数据分析</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="feature-item">
              <el-icon :size="32" color="#67c23a"><MagicStick /></el-icon>
              <h4>自动创意</h4>
              <p>一键生成营销创意内容</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="feature-item">
              <el-icon :size="32" color="#e6a23c"><TrendCharts /></el-icon>
              <h4>效果追踪</h4>
              <p>实时监控营销效果</p>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  Lock,
  Message,
  ChatDotRound,
  DataAnalysis,
  MagicStick,
  TrendCharts,
  Promotion,
} from '@element-plus/icons-vue'
import { authApi } from '@/api'

const router = useRouter()
const route = useRoute()

// 默认重定向到仪表盘
const defaultRedirect = '/dashboard'
const redirectPath = computed(() => {
  const redirect = route.query.redirect as string
  return redirect || defaultRedirect
})

const activeTab = ref('local')
const localLoading = ref(false)

// 本地登录表单
const loginFormRef = ref<FormInstance>()
const loginForm = reactive({
  email: '',
  password: '',
})

const loginRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
}

// 本地登录
const handleLocalLogin = async () => {
  console.log('点击登录按钮')
  if (!loginFormRef.value) {
    console.log('loginFormRef 为空')
    return
  }

  await loginFormRef.value.validate(async (valid) => {
    console.log('表单验证结果:', valid)
    if (!valid) return

    localLoading.value = true
    console.log('开始登录请求:', loginForm.email)
    
    try {
      const res = await authApi.login({
        email: loginForm.email,
        password: loginForm.password,
      })

      console.log('登录响应:', res)
      
      // 保存 token - 使用统一的 key
      localStorage.setItem('auth_token', res.access_token)
      localStorage.setItem('auth_user', JSON.stringify(res.user || {}))
      localStorage.setItem('refresh_token', res.refresh_token)

      console.log('Token已保存，准备跳转到:', redirectPath.value)
      ElMessage.success('登录成功')
      
      // 延迟跳转，确保消息显示
      setTimeout(() => {
        const targetUrl = redirectPath.value || '/dashboard'
        console.log('执行跳转:', targetUrl)
        window.location.href = targetUrl
      }, 1000)
    } catch (error: any) {
      console.error('登录失败:', error)
      ElMessage.error(error.response?.data?.message || '登录失败')
    } finally {
      localLoading.value = false
    }
  })
}

// 微信登录
const handleWechatLogin = () => {
  ElMessage.info('微信登录功能开发中')
}

// GitHub 登录
const handleGithubLogin = () => {
  ElMessage.info('GitHub 登录功能开发中')
}

// 页面加载时检查是否已登录
onMounted(() => {
  // 检查本地 token - 使用统一的 key
  const token = localStorage.getItem('auth_token')
  if (token) {
    // 已登录，直接跳转到仪表盘
    console.log('页面加载：已有token，跳转到仪表盘')
    window.location.href = defaultRedirect
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/digital-command-center.scss' as dcc;

.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dcc-bg-primary);
  background-image: 
    radial-gradient(ellipse at 20% 20%, hsla(280 60% 50% / 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, hsla(190 80% 50% / 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, hsla(270 80% 60% / 0.08) 0%, transparent 70%);
  padding: var(--dcc-spacing-lg);
}

.login-container {
  width: 100%;
  max-width: 480px;
}

.login-header {
  text-align: center;
  margin-bottom: var(--dcc-spacing-xl);

  .logo {
    margin-bottom: var(--dcc-spacing-md);
    
    :deep(.el-icon) {
      font-size: 48px;
      color: var(--dcc-accent-cyan);
      filter: drop-shadow(0 0 20px hsla(190 100% 50% / 0.5));
    }
  }

  h1 {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 var(--dcc-spacing-sm) 0;
    background: var(--dcc-gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
  }

  .subtitle {
    font-size: var(--dcc-font-size-md);
    color: var(--dcc-text-secondary);
    margin: 0;
  }
}

.login-card {
  @include dcc.glass-card;
  margin-bottom: var(--dcc-spacing-xl);
  border: 1px solid var(--dcc-border-color);
  
  :deep(.el-card__body) {
    padding: var(--dcc-spacing-xl);
  }
}

.auth-section {
  text-align: center;
  padding: var(--dcc-spacing-md) 0;

  .auth-description {
    color: var(--dcc-text-secondary);
    margin-bottom: var(--dcc-spacing-lg);
  }
}

.login-form {
  padding: var(--dcc-spacing-sm) 0;
  
  :deep(.el-form-item__label) {
    color: var(--dcc-text-secondary);
  }
  
  :deep(.el-input__wrapper) {
    background: var(--dcc-bg-input);
    border-color: var(--dcc-border-color);
    box-shadow: none;
    
    &:focus-within {
      border-color: var(--dcc-accent-cyan);
      box-shadow: 0 0 0 2px hsla(190 100% 50% / 0.1);
    }
  }
  
  :deep(.el-input__inner) {
    color: var(--dcc-text-primary);
  }
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: var(--dcc-font-size-lg);
  font-weight: 600;
  @include dcc.gradient-button;
  border-radius: var(--dcc-radius-md);
}

.login-footer {
  margin-top: var(--dcc-spacing-lg);

  .social-login {
    display: flex;
    justify-content: center;
    gap: var(--dcc-spacing-md);
    margin-top: var(--dcc-spacing-md);
    
    .el-button {
      background: var(--dcc-bg-card);
      border-color: var(--dcc-border-color);
      color: var(--dcc-text-secondary);
      
      &:hover {
        border-color: var(--dcc-accent-cyan);
        color: var(--dcc-accent-cyan);
      }
    }
  }
}

.login-features {
  color: var(--dcc-text-secondary);
  text-align: center;

  .feature-item {
    padding: var(--dcc-spacing-sm);

    h4 {
      margin: var(--dcc-spacing-sm) 0 var(--dcc-spacing-xs) 0;
      font-size: var(--dcc-font-size-sm);
      font-weight: 600;
      color: var(--dcc-text-primary);
    }

    p {
      margin: 0;
      font-size: var(--dcc-font-size-xs);
      color: var(--dcc-text-secondary);
    }
    
    :deep(.el-icon) {
      font-size: 24px;
      color: var(--dcc-accent-cyan);
    }
  }
}

/* GitHub 图标样式 */
.github-icon {
  width: 20px;
  height: 20px;
}

// 标签页样式
:deep(.el-tabs__item) {
  color: var(--dcc-text-secondary);
  
  &.is-active {
    color: var(--dcc-accent-cyan);
  }
  
  &:hover {
    color: var(--dcc-accent-cyan);
  }
}

:deep(.el-tabs__active-bar) {
  background: var(--dcc-gradient-primary);
}
</style>
