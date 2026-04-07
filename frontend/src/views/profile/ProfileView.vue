<template>
  <div class="profile-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>个人中心</h1>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：用户信息 -->
      <el-col :span="8">
        <el-card class="profile-card">
          <div class="profile-header">
            <el-avatar :size="100" :src="userAvatar" class="profile-avatar" />
            <h2 class="profile-name">{{ userName }}</h2>
            <p class="profile-email">{{ userEmail }}</p>
            <el-tag v-if="userRole" :type="getRoleType(userRole)">{{ userRole }}</el-tag>
          </div>

          <el-divider />

          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-value">{{ stats.totalTasks }}</div>
              <div class="stat-label">总任务</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.activeTasks }}</div>
              <div class="stat-label">进行中</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.completedTasks }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>

          <el-divider />

          <div class="profile-actions">
            <el-button type="primary" @click="showEditDialog = true">
              <el-icon><Edit /></el-icon>编辑资料
            </el-button>
            <el-button type="danger" plain @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：详细信息和设置 -->
      <el-col :span="16">
        <el-tabs v-model="activeTab" type="border-card">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户ID">{{ user?.sub || '-' }}</el-descriptions-item>
              <el-descriptions-item label="用户名">{{ userName }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ userEmail }}</el-descriptions-item>
              <el-descriptions-item label="昵称">{{ user?.nickname || '-' }}</el-descriptions-item>
              <el-descriptions-item label="邮箱验证">
                <el-tag :type="user?.email_verified ? 'success' : 'warning'">
                  {{ user?.email_verified ? '已验证' : '未验证' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="注册时间">{{ formatDate(user?.created_at) }}</el-descriptions-item>
              <el-descriptions-item label="最后登录">{{ formatDate(user?.updated_at) }}</el-descriptions-item>
              <el-descriptions-item label="登录方式">Auth0</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <!-- 账号设置 -->
          <el-tab-pane label="账号设置" name="settings">
            <el-form :model="settingsForm" label-width="120px">
              <el-form-item label="语言">
                <el-select v-model="settingsForm.language" style="width: 200px">
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="English" value="en" />
                </el-select>
              </el-form-item>
              <el-form-item label="主题">
                <el-radio-group v-model="settingsForm.theme">
                  <el-radio-button label="light">浅色</el-radio-button>
                  <el-radio-button label="dark">深色</el-radio-button>
                  <el-radio-button label="auto">跟随系统</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="通知设置">
                <el-checkbox-group v-model="settingsForm.notifications">
                  <el-checkbox label="email">邮件通知</el-checkbox>
                  <el-checkbox label="push">推送通知</el-checkbox>
                  <el-checkbox label="sms">短信通知</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveSettings">保存设置</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 安全设置 -->
          <el-tab-pane label="安全设置" name="security">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="修改密码">
                <el-button type="primary" link @click="showPasswordDialog = true">修改密码</el-button>
              </el-descriptions-item>
              <el-descriptions-item label="双重认证">
                <div class="security-item">
                  <span>未开启</span>
                  <el-button type="primary" link>开启</el-button>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="登录设备">
                <div class="security-item">
                  <span>当前设备</span>
                  <el-button type="danger" link>退出其他设备</el-button>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="API 密钥">
                <div class="security-item">
                  <span>************</span>
                  <el-button type="primary" link @click="showApiKeyDialog = true">查看/重置</el-button>
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <!-- 操作日志 -->
          <el-tab-pane label="操作日志" name="logs">
            <el-timeline>
              <el-timeline-item
                v-for="(log, index) in operationLogs"
                :key="index"
                :type="log.type"
                :timestamp="log.time"
              >
                {{ log.content }}
              </el-timeline-item>
            </el-timeline>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑资料" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
          >
            <img v-if="editForm.avatar" :src="editForm.avatar" class="avatar-preview" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="500px">
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="当前密码">
          <el-input v-model="passwordForm.currentPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" :loading="changingPassword" @click="changePassword">确认修改</el-button>
      </template>
    </el-dialog>

    <!-- API 密钥对话框 -->
    <el-dialog v-model="showApiKeyDialog" title="API 密钥" width="500px">
      <el-alert
        title="请妥善保管您的 API 密钥，不要泄露给他人"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      />
      <el-input v-model="apiKey" readonly type="textarea" :rows="3" />
      <template #footer>
        <el-button @click="showApiKeyDialog = false">关闭</el-button>
        <el-button type="primary" @click="copyApiKey">复制</el-button>
        <el-button type="danger" @click="resetApiKey">重置密钥</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, SwitchButton, Plus } from '@element-plus/icons-vue'
import { dashboardApi } from '@/api'

const { user, logout: auth0Logout } = useAuth0()

// 用户信息
const userName = computed(() => user.value?.name || user.value?.nickname || '用户')
const userEmail = computed(() => user.value?.email || '-')
const userAvatar = computed(() => user.value?.picture || '')
const userRole = computed(() => '管理员')

// 统计数据
const stats = reactive({
  totalTasks: 0,
  activeTasks: 0,
  completedTasks: 0,
})

// 当前标签页
const activeTab = ref('basic')

// 设置表单
const settingsForm = reactive({
  language: 'zh-CN',
  theme: 'light',
  notifications: ['email'],
})

// 编辑表单
const showEditDialog = ref(false)
const saving = ref(false)
const editForm = reactive({
  nickname: '',
  avatar: '',
})

// 密码表单
const showPasswordDialog = ref(false)
const changingPassword = ref(false)
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// API 密钥
const showApiKeyDialog = ref(false)
const apiKey = ref('sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')

// 操作日志
const operationLogs = ref([
  { type: 'primary', time: '2024-01-15 10:30:00', content: '登录系统' },
  { type: 'success', time: '2024-01-15 09:15:00', content: '创建营销任务：春节促销活动' },
  { type: 'success', time: '2024-01-14 16:45:00', content: '完成创意审核' },
  { type: 'warning', time: '2024-01-14 14:20:00', content: '修改账号设置' },
  { type: 'primary', time: '2024-01-14 09:00:00', content: '登录系统' },
])

// 获取角色类型
const getRoleType = (role: string) => {
  const map: Record<string, string> = {
    管理员: 'danger',
    编辑: 'warning',
    用户: 'success',
  }
  return map[role] || 'info'
}

// 格式化日期
const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await dashboardApi.getMetrics()
    stats.totalTasks = res.totalTasks
    stats.activeTasks = res.activeTasks
    stats.completedTasks = res.completedTasks
  } catch (error) {
    console.error(error)
  }
}

// 保存设置
const saveSettings = () => {
  ElMessage.success('设置已保存')
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    auth0Logout({ logoutParams: { returnTo: window.location.origin } })
  })
}

// 头像上传
const handleAvatarChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    editForm.avatar = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

// 保存资料
const saveProfile = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    showEditDialog.value = false
    ElMessage.success('资料已更新')
  }, 1000)
}

// 修改密码
const changePassword = () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  changingPassword.value = true
  setTimeout(() => {
    changingPassword.value = false
    showPasswordDialog.value = false
    ElMessage.success('密码修改成功')
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  }, 1000)
}

// 复制 API 密钥
const copyApiKey = () => {
  navigator.clipboard.writeText(apiKey.value)
  ElMessage.success('已复制到剪贴板')
}

// 重置 API 密钥
const resetApiKey = () => {
  ElMessageBox.confirm('确定要重置 API 密钥吗？重置后旧密钥将失效', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    apiKey.value = 'sk-' + Math.random().toString(36).substring(2, 34)
    ElMessage.success('API 密钥已重置')
  })
}

onMounted(() => {
  loadStats()
  editForm.nickname = user.value?.nickname || ''
  editForm.avatar = user.value?.picture || ''
})
</script>

<style scoped lang="scss">
@use '@/styles/digital-command-center.scss' as dcc;

.profile-view {
  @include dcc.page-container;
}

.page-header {
  margin-bottom: var(--dcc-spacing-lg);

  h1 {
    @include dcc.page-title;
  }
}

:deep(.el-card) {
  @include dcc.glass-card;
  
  .el-card__header {
    color: var(--dcc-text-primary);
    font-size: var(--dcc-font-size-lg);
    font-weight: 600;
    border-bottom: 1px solid var(--dcc-border-color);
    padding: var(--dcc-spacing-md) var(--dcc-spacing-lg);
  }
}

.profile-card {
  .profile-header {
    text-align: center;
    padding: var(--dcc-spacing-lg) 0;

    .profile-avatar {
      margin-bottom: var(--dcc-spacing-md);
      border: 3px solid var(--dcc-accent-cyan);
      box-shadow: 0 0 20px hsla(190 100% 50% / 0.3);
    }

    .profile-name {
      margin: 0 0 var(--dcc-spacing-sm) 0;
      font-size: 22px;
      font-weight: 600;
      color: var(--dcc-text-primary);
    }

    .profile-email {
      margin: 0 0 var(--dcc-spacing-sm) 0;
      color: var(--dcc-text-secondary);
      font-size: var(--dcc-font-size-sm);
    }
  }

  .profile-stats {
    display: flex;
    justify-content: space-around;
    padding: var(--dcc-spacing-sm) 0;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        background: var(--dcc-gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .stat-label {
        font-size: var(--dcc-font-size-xs);
        color: var(--dcc-text-secondary);
        margin-top: var(--dcc-spacing-xs);
      }
    }
  }

  .profile-actions {
    display: flex;
    flex-direction: column;
    gap: var(--dcc-spacing-sm);
    padding: 0 var(--dcc-spacing-lg) var(--dcc-spacing-lg);

    .el-button {
      width: 100%;
      
      &.el-button--primary {
        @include dcc.gradient-button;
      }
    }
  }
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--dcc-spacing-md) 0;
  border-bottom: 1px solid var(--dcc-border-color);
  
  &:last-child {
    border-bottom: none;
  }
}

.avatar-uploader {
  :deep(.el-upload) {
    border: 2px dashed var(--dcc-border-color);
    border-radius: var(--dcc-radius-md);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    background: var(--dcc-bg-input);

    &:hover {
      border-color: var(--dcc-accent-cyan);
      box-shadow: 0 0 15px hsla(190 100% 50% / 0.2);
    }
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: var(--dcc-text-secondary);
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}

// 对话框样式
:deep(.el-dialog) {
  background: var(--dcc-bg-secondary);
  border: 1px solid var(--dcc-border-color);
  border-radius: var(--dcc-radius-lg);
  
  .el-dialog__header {
    border-bottom: 1px solid var(--dcc-border-color);
    padding: var(--dcc-spacing-lg);
    margin-right: 0;
    
    .el-dialog__title {
      color: var(--dcc-text-primary);
      font-weight: 600;
    }
  }
  
  .el-dialog__body {
    padding: var(--dcc-spacing-lg);
  }
  
  .el-form-item__label {
    color: var(--dcc-text-secondary);
  }
  
  .el-input__wrapper {
    background: var(--dcc-bg-input);
    border-color: var(--dcc-border-color);
    box-shadow: none;
  }
  
  .el-input__inner,
  .el-textarea__inner {
    color: var(--dcc-text-primary);
  }
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

:deep(.el-tabs__nav-wrap::after) {
  background: var(--dcc-border-color);
}

// 警告框样式
:deep(.el-alert) {
  background: hsla(38 92% 50% / 0.1);
  border: 1px solid hsla(38 92% 50% / 0.2);
  
  .el-alert__title {
    color: var(--dcc-accent-orange);
  }
}
</style>
