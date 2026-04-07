<template>
  <div class="task-detail-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>返回
        </el-button>
        <h1>{{ task?.name || '任务详情' }}</h1>
        <el-tag :type="getStatusType(task?.status)">{{ getStatusLabel(task?.status) }}</el-tag>
      </div>
      <div class="header-right">
        <el-button type="warning" @click="$router.push(`/creatives/${taskId}`)">
          <el-icon><MagicStick /></el-icon>创意工坊
        </el-button>
        <el-button @click="$router.push(`/analytics/${taskId}`)">
          <el-icon><TrendCharts /></el-icon>效果分析
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：任务信息和阶段 -->
      <el-col :span="16">
        <!-- 任务基本信息 -->
        <el-card class="info-card" v-loading="loading">
          <template #header>
            <span>基本信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="任务描述">{{ task?.description || '-' }}</el-descriptions-item>
            <el-descriptions-item label="预算">{{ task?.budget ? `¥${task.budget}` : '-' }}</el-descriptions-item>
            <el-descriptions-item label="开始日期">{{ formatDate(task?.startDate) }}</el-descriptions-item>
            <el-descriptions-item label="结束日期">{{ formatDate(task?.endDate) }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDateTime(task?.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDateTime(task?.updatedAt) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 阶段进度 -->
        <el-card class="stages-card">
          <template #header>
            <div class="stages-header">
              <span>阶段进度</span>
              <span class="progress-text">完成 {{ progressPercent }}%</span>
            </div>
          </template>
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <el-timeline class="stages-timeline">
            <el-timeline-item
              v-for="stage in stageList"
              :key="stage.id"
              :type="getStageTimelineType(stage.status)"
              :icon="getStageIcon(stage.status)"
              :hollow="stage.status === 'pending'"
            >
              <div class="stage-item">
                <div class="stage-header">
                  <span class="stage-name">{{ getStageLabel(stage.stage) }}</span>
                  <el-tag :type="getStageStatusType(stage.status)" size="small">
                    {{ getStageStatusLabel(stage.status) }}
                  </el-tag>
                </div>
                <div class="stage-time">{{ formatDateTime(stage.createdAt) }}</div>

                <div v-if="stage.output && typeof stage.output === 'object'" class="stage-output">
                  <div v-if="stage.output.creatives && stage.output.creatives.length > 0" class="stage-creatives">
                    <div class="creatives-label">创意内容</div>
                    <div v-for="(creative, idx) in stage.output.creatives" :key="idx" class="creative-mini-item">
                      <el-tag size="small" :type="getCreativeType(creative.type)">{{ getCreativeTypeLabel(creative.type) }}</el-tag>
                      <span class="creative-mini-title">{{ creative.title || '未命名' }}</span>
                    </div>
                  </div>
                  <pre v-if="stage.output.result !== undefined && stage.output.result !== null">{{ formatStageResult(stage.output.result) }}</pre>
                  <pre v-else-if="Object.keys(stage.output).length > 0">{{ formatStageResult(stage.output) }}</pre>
                  <div v-else class="empty-output">暂无输出内容</div>
                </div>
                <div v-else-if="stage.output && typeof stage.output === 'string'" class="stage-output">
                  <pre>{{ stage.output }}</pre>
                </div>

                <div v-if="stage.status === 'processing' || (stage.status === 'pending' && !hasUncompletedStageBefore(stage.id))" class="stage-action">
                  <el-input
                    v-model="stageOutputText"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入阶段输出内容（可选）"
                    class="stage-input"
                  />
                  <div class="stage-action-buttons">
                    <el-button type="primary" :loading="advancing" @click="confirmAdvanceStage(stage.id)">
                      <el-icon><ArrowRight /></el-icon>完成阶段并继续
                    </el-button>
                  </div>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <!-- 右侧：创意列表 -->
      <el-col :span="8">
        <el-card class="creatives-card">
          <template #header>
            <div class="creatives-header">
              <span>创意列表</span>
              <el-dropdown @command="handleCreativeCommand">
                <el-button type="primary" link>
                  <el-icon><Plus /></el-icon>添加创意
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="text">AI 文案</el-dropdown-item>
                    <el-dropdown-item command="image">AI 图片</el-dropdown-item>
                    <el-dropdown-item command="manual">手动添加</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <div v-if="creativeList.length === 0" class="empty-creatives">
            <el-empty description="暂无创意" />
          </div>
          <div v-else class="creative-list">
            <div
              v-for="creative in creativeList"
              :key="creative.id"
              class="creative-item"
            >
              <div class="creative-header">
                <el-tag size="small" :type="getCreativeType(creative.type)">{{ getCreativeTypeLabel(creative.type) }}</el-tag>
                <el-tag v-if="creative.aiGenerated" size="small" type="success">AI</el-tag>
              </div>
              <div class="creative-title">{{ creative.title || '未命名创意' }}</div>
              <div class="creative-content" v-if="creative.type === 'image' && creative.content?.url">
                <img :src="creative.content.url" alt="" class="creative-image" />
              </div>
              <div class="creative-content" v-else-if="creative.content">
                <pre v-if="typeof creative.content === 'object' && creative.content !== null">{{ JSON.stringify(creative.content, null, 2) }}</pre>
                <span v-else>{{ creative.content }}</span>
              </div>
              <div class="creative-footer">
                <span class="creative-time">{{ formatDateTime(creative.createdAt) }}</span>
                <div class="creative-actions">
                  <el-button link type="primary" size="small" @click="handleCopyCreative(creative)">复制</el-button>
                  <el-button link type="success" size="small" @click="handleDownloadCreative(creative)">下载</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- AI 文案生成对话框 -->
    <el-dialog
      v-model="showAITextDialog"
      title="AI 文案生成"
      width="700px"
      destroy-on-close
    >
      <el-form :model="aiTextForm" label-width="120px">
        <el-form-item label="文案类型">
          <el-select v-model="aiTextForm.type" placeholder="选择文案类型" style="width: 100%">
            <el-option label="社交媒体帖文" value="social_post" />
            <el-option label="落地页文案" value="landing_page" />
            <el-option label="邮件内容" value="email" />
            <el-option label="广告标题" value="headline" />
            <el-option label="广告描述" value="description" />
          </el-select>
        </el-form-item>
        <el-form-item label="营销主题">
          <el-input
            v-model="aiTextForm.prompt"
            type="textarea"
            rows="3"
            placeholder="请输入营销主题或产品描述"
          />
        </el-form-item>
        <el-form-item label="AI模型">
          <el-select v-model="aiTextForm.model" placeholder="选择模型" style="width: 100%">
            <el-option label="智谱 GLM-4" value="glm-4" />
            <el-option label="智谱 GLM-3" value="glm-3" />
          </el-select>
        </el-form-item>
      </el-form>
      <div v-if="aiTextResult" class="ai-result">
        <div class="ai-result-header">
          <span>生成结果</span>
          <el-button link type="primary" @click="handleCopyText(aiTextResult)">复制</el-button>
        </div>
        <div class="ai-result-content">
          <pre>{{ aiTextResult }}</pre>
        </div>
      </div>
      <template #footer>
        <el-button @click="showAITextDialog = false">取消</el-button>
        <el-button type="primary" :loading="aiTextLoading" @click="handleGenerateText">
          生成文案
        </el-button>
      </template>
    </el-dialog>

    <!-- AI 图片生成对话框 -->
    <el-dialog
      v-model="showAIImageDialog"
      title="AI 图片生成"
      width="700px"
      destroy-on-close
    >
      <el-form :model="aiImageForm" label-width="120px">
        <el-form-item label="图片描述">
          <el-input
            v-model="aiImageForm.prompt"
            type="textarea"
            rows="3"
            placeholder="请输入图片描述"
          />
        </el-form-item>
        <el-form-item label="图片风格">
          <el-select v-model="aiImageForm.style" placeholder="选择风格" style="width: 100%">
            <el-option label="现代简约" value="modern" />
            <el-option label="科技感" value="tech" />
            <el-option label="活泼可爱" value="playful" />
            <el-option label="专业商务" value="professional" />
          </el-select>
        </el-form-item>
        <el-form-item label="图片比例">
          <el-select v-model="aiImageForm.ratio" placeholder="选择比例" style="width: 100%">
            <el-option label="16:9 横幅" value="16:9" />
            <el-option label="1:1 方形" value="1:1" />
            <el-option label="9:16 竖版" value="9:16" />
          </el-select>
        </el-form-item>
        <el-form-item label="AI模型">
          <el-select v-model="aiImageForm.model" placeholder="选择模型" style="width: 100%">
            <el-option label="智谱 CogView" value="cogview" />
          </el-select>
        </el-form-item>
      </el-form>
      <div v-if="aiImageResult" class="ai-result">
        <div class="ai-result-header">
          <span>生成结果</span>
          <el-button link type="primary" @click="handleDownloadImage">下载</el-button>
        </div>
        <div class="ai-result-content ai-image-preview">
          <img :src="aiImageResult" alt="AI生成的图片" />
        </div>
      </div>
      <template #footer>
        <el-button @click="showAIImageDialog = false">取消</el-button>
        <el-button type="primary" :loading="aiImageLoading" @click="handleGenerateImage">
          生成图片
        </el-button>
      </template>
    </el-dialog>

    <!-- 手动添加创意对话框 -->
    <el-dialog
      v-model="showCreateCreative"
      title="添加创意"
      width="600px"
      destroy-on-close
    >
      <el-form ref="creativeFormRef" :model="creativeForm" :rules="creativeRules" label-width="100px">
        <el-form-item label="创意类型" prop="type">
          <el-select v-model="creativeForm.type" placeholder="选择类型" style="width: 100%">
            <el-option label="文本" value="text" />
            <el-option label="图片" value="image" />
            <el-option label="视频" value="video" />
            <el-option label="轮播" value="carousel" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="creativeForm.title" placeholder="请输入创意标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="creativeContentText"
            type="textarea"
            rows="5"
            placeholder="请输入创意内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateCreative = false">取消</el-button>
        <el-button type="primary" :loading="creatingCreative" @click="handleCreateCreative">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  ArrowLeft,
  ArrowRight,
  TrendCharts,
  Plus,
  CircleCheck,
  CircleClose,
  Loading,
  Warning,
  MagicStick,
} from '@element-plus/icons-vue'
import { marketingTasksApi, aiApi } from '@/api'
import type { MarketingTask, TaskStageOutput, AdCreative, CreateCreativeData } from '@/api'

const route = useRoute()
const router = useRouter()
const taskId = route.params.id as string

const loading = ref(false)
const task = ref<MarketingTask | null>(null)
const stageList = ref<TaskStageOutput[]>([])
const creativeList = ref<AdCreative[]>([])

// 计算进度百分比
const progressPercent = computed(() => {
  if (stageList.value.length === 0) return 0
  const completed = stageList.value.filter(s => s.status === 'completed').length
  return Math.round((completed / stageList.value.length) * 100)
})

// 阶段推进
const advancing = ref(false)
const stageOutputText = ref('')

// AI 文案生成
const showAITextDialog = ref(false)
const aiTextLoading = ref(false)
const aiTextResult = ref('')
const aiTextForm = reactive({
  type: 'social_post',
  prompt: '',
  model: 'glm-4',
})

// AI 图片生成
const showAIImageDialog = ref(false)
const aiImageLoading = ref(false)
const aiImageResult = ref('')
const aiImageForm = reactive({
  prompt: '',
  style: 'modern',
  ratio: '16:9',
  model: 'cogview',
})

// 创建创意
const showCreateCreative = ref(false)
const creatingCreative = ref(false)
const creativeFormRef = ref<FormInstance>()
const creativeForm = reactive<CreateCreativeData>({
  type: 'text',
  title: '',
  content: '',
  aiGenerated: false,
  aiModel: '',
})
const creativeContentText = ref('')

const creativeRules: FormRules = {
  type: [{ required: true, message: '请选择创意类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入创意内容', trigger: 'blur' }],
}

// 获取状态类型
const getStatusType = (status?: string) => {
  const map: Record<string, string> = {
    draft: 'info',
    active: 'warning',
    completed: 'success',
    paused: 'danger',
  }
  return map[status || ''] || 'info'
}

// 获取状态标签
const getStatusLabel = (status?: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    active: '进行中',
    completed: '已完成',
    paused: '已暂停',
  }
  return map[status || ''] || status || '-'
}

// 获取阶段标签
const getStageLabel = (stage: string) => {
  const map: Record<string, string> = {
    data_collection: '数据采集',
    market_analysis: '市场分析',
    strategy: '策略制定',
    planning: '计划规划',
    creative: '创意生成',
    execution: '投放执行',
    analysis: '效果分析',
    optimization: '优化迭代',
  }
  return map[stage] || stage
}

// 获取阶段时间线类型
const getStageTimelineType = (status: string) => {
  const map: Record<string, any> = {
    completed: 'success',
    processing: 'warning',
    pending: '',
    failed: 'danger',
  }
  return map[status]
}

// 获取阶段图标
const getStageIcon = (status: string) => {
  const map: Record<string, any> = {
    completed: CircleCheck,
    processing: Loading,
    pending: Warning,
    failed: CircleClose,
  }
  return map[status]
}

// 获取阶段状态类型
const getStageStatusType = (status: string) => {
  const map: Record<string, string> = {
    completed: 'success',
    processing: 'warning',
    pending: 'info',
    failed: 'danger',
  }
  return map[status] || 'info'
}

// 获取阶段状态标签
const getStageStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    completed: '已完成',
    processing: '进行中',
    pending: '待处理',
    failed: '失败',
  }
  return map[status] || status
}

// 获取创意类型
const getCreativeType = (type: string) => {
  const map: Record<string, string> = {
    text: 'primary',
    image: 'success',
    video: 'warning',
    carousel: 'info',
  }
  return map[type] || 'info'
}

// 获取创意状态类型
const getCreativeStatusType = (status: string) => {
  const map: Record<string, string> = {
    draft: 'info',
    approved: 'success',
    rejected: 'danger',
    published: 'primary',
  }
  return map[status] || 'info'
}

// 获取创意状态标签
const getCreativeStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    approved: '已通过',
    rejected: '已拒绝',
    published: '已发布',
  }
  return map[status] || status
}

// 格式化日期
const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 格式化阶段输出结果
const formatStageResult = (result: any): string => {
  if (typeof result === 'string') return result
  if (typeof result === 'object' && result !== null) {
    return JSON.stringify(result, null, 2)
  }
  return String(result)
}

// 加载任务详情
const loadTaskDetail = async () => {
  loading.value = true
  try {
    const res = await marketingTasksApi.getTask(taskId)
    task.value = res
    stageList.value = res.stages || []
    creativeList.value = res.creatives || []
  } catch (error) {
    ElMessage.error('加载任务详情失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 检查指定阶段之前是否有未完成的阶段
const hasUncompletedStageBefore = (stageId: string) => {
  const stageIndex = stageList.value.findIndex(s => s.id === stageId)
  if (stageIndex <= 0) return false
  const previousStages = stageList.value.slice(0, stageIndex)
  return previousStages.some(s => s.status === 'completed')
}

// 推进阶段
const confirmAdvanceStage = async (stageId: string) => {
  advancing.value = true
  try {
    let output: any = { result: stageOutputText.value }
    if (stageOutputText.value) {
      try {
        output = JSON.parse(stageOutputText.value)
      } catch {
        output = { result: stageOutputText.value }
      }
    }

    await marketingTasksApi.completeStage(taskId, stageId, output)
    ElMessage.success('阶段已完成，自动进入下一阶段')
    stageOutputText.value = ''
    loadTaskDetail()
  } catch (error) {
    ElMessage.error('推进阶段失败')
    console.error(error)
  } finally {
    advancing.value = false
  }
}

// 创建创意
const handleCreateCreative = async () => {
  if (!creativeFormRef.value) return
  
  await creativeFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    creatingCreative.value = true
    try {
      let content: any = creativeContentText.value
      try {
        content = JSON.parse(creativeContentText.value)
      } catch {
        // 保持文本格式
      }
      
      await marketingTasksApi.createCreative(taskId, {
        ...creativeForm,
        content,
      })
      ElMessage.success('创意添加成功')
      showCreateCreative.value = false
      loadTaskDetail()
      
      creativeForm.type = 'text'
      creativeForm.title = ''
      creativeForm.content = ''
      creativeForm.aiGenerated = false
      creativeForm.aiModel = ''
      creativeContentText.value = ''
    } catch (error) {
      ElMessage.error('添加创意失败')
      console.error(error)
    } finally {
      creatingCreative.value = false
    }
  })
}

// 获取创意类型标签
const getCreativeTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    text: '文本',
    image: '图片',
    video: '视频',
    carousel: '轮播',
  }
  return map[type] || type
}

// 处理创意下拉菜单命令
const handleCreativeCommand = (command: string) => {
  if (command === 'text') {
    aiTextForm.prompt = task.value?.description || ''
    showAITextDialog.value = true
  } else if (command === 'image') {
    aiImageForm.prompt = task.value?.description || ''
    showAIImageDialog.value = true
  } else {
    showCreateCreative.value = true
  }
}

// 生成 AI 文案
const handleGenerateText = async () => {
  if (!aiTextForm.prompt) {
    ElMessage.warning('请输入营销主题')
    return
  }
  
  aiTextLoading.value = true
  try {
    const res = await aiApi.generateText({
      prompt: aiTextForm.prompt,
      type: aiTextForm.type,
      model: aiTextForm.model,
    })
    aiTextResult.value = res.data?.result || res.result || JSON.stringify(res, null, 2)
  } catch (error: any) {
    ElMessage.error(error?.message || '生成文案失败')
    aiTextResult.value = ''
  } finally {
    aiTextLoading.value = false
  }
}

// 复制文案
const handleCopyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

// 生成 AI 图片
const handleGenerateImage = async () => {
  if (!aiImageForm.prompt) {
    ElMessage.warning('请输入图片描述')
    return
  }
  
  aiImageLoading.value = true
  try {
    const res = await aiApi.generateImage({
      prompt: aiImageForm.prompt,
      style: aiImageForm.style,
      ratio: aiImageForm.ratio,
      model: aiImageForm.model,
    })
    aiImageResult.value = res.data?.url || res.url || ''
    if (!aiImageResult.value) {
      ElMessage.warning('生成的图片地址为空')
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '生成图片失败')
    aiImageResult.value = ''
  } finally {
    aiImageLoading.value = false
  }
}

// 下载图片
const handleDownloadImage = async () => {
  if (!aiImageResult.value) return
  try {
    const response = await fetch(aiImageResult.value)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ai-image-${Date.now()}.png`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('图片下载成功')
  } catch {
    ElMessage.error('下载失败')
  }
}

// 复制创意内容
const handleCopyCreative = async (creative: AdCreative) => {
  try {
    const text = typeof creative.content === 'object' 
      ? JSON.stringify(creative.content, null, 2) 
      : String(creative.content)
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

// 下载创意内容
const handleDownloadCreative = async (creative: AdCreative) => {
  try {
    if (creative.type === 'image' && creative.content?.url) {
      const response = await fetch(creative.content.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `creative-${creative.id}.png`
      link.click()
      window.URL.revokeObjectURL(url)
    } else {
      const text = typeof creative.content === 'object' 
        ? JSON.stringify(creative.content, null, 2) 
        : String(creative.content)
      const blob = new Blob([text], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `creative-${creative.id}.txt`
      link.click()
      window.URL.revokeObjectURL(url)
    }
    ElMessage.success('下载成功')
  } catch {
    ElMessage.error('下载失败')
  }
}

onMounted(() => {
  loadTaskDetail()
})
</script>

<style scoped lang="scss">
@use '@/styles/digital-command-center.scss' as dcc;

.task-detail-view {
  @include dcc.page-container;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--dcc-spacing-lg);

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--dcc-spacing-md);

    h1 {
      @include dcc.page-title;
    }
  }

  .header-right {
    display: flex;
    gap: var(--dcc-spacing-sm);
  }
}

.info-card,
.stages-card,
.creatives-card {
  @include dcc.glass-card;
  margin-bottom: var(--dcc-spacing-lg);
  
  :deep(.el-card__header) {
    color: var(--dcc-text-primary);
    font-size: var(--dcc-font-size-lg);
    font-weight: 600;
    border-bottom: 1px solid var(--dcc-border-color);
    padding: var(--dcc-spacing-md) var(--dcc-spacing-lg);
  }
}

:deep(.el-descriptions) {
  .el-descriptions__label {
    color: var(--dcc-text-secondary);
    background: hsla(222 47% 14% / 0.5);
  }
  
  .el-descriptions__content {
    color: var(--dcc-text-primary);
    background: transparent;
  }
}

:deep(.el-timeline) {
  .el-timeline-item__node {
    background: var(--dcc-accent-cyan);
    box-shadow: 0 0 12px var(--dcc-accent-cyan);
  }
  
  .el-timeline-item__tail {
    border-left-color: var(--dcc-border-color);
  }
}

.stages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  
  .progress-text {
    font-size: var(--dcc-font-size-sm);
    color: var(--dcc-accent-cyan);
    font-weight: 600;
  }
}

.progress-bar-container {
  height: 6px;
  background: hsla(222 47% 14% / 0.8);
  border-radius: 3px;
  margin-bottom: var(--dcc-spacing-lg);
  overflow: hidden;
  
  .progress-bar {
    height: 100%;
    background: var(--dcc-gradient-primary);
    border-radius: 3px;
    transition: width 0.5s ease;
    box-shadow: 0 0 10px var(--dcc-accent-cyan);
  }
}

.stages-timeline {
  margin-top: var(--dcc-spacing-md);
}

.stage-item {
  .stage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--dcc-spacing-sm);

    .stage-name {
      font-weight: 600;
      font-size: var(--dcc-font-size-lg);
      color: var(--dcc-text-primary);
    }
  }

  .stage-time {
    color: var(--dcc-text-secondary);
    font-size: var(--dcc-font-size-xs);
    margin-bottom: var(--dcc-spacing-sm);
  }

  .stage-output {
    background: hsla(222 47% 14% / 0.5);
    padding: var(--dcc-spacing-md);
    border-radius: var(--dcc-radius-sm);
    margin-top: var(--dcc-spacing-sm);
    border: 1px solid var(--dcc-border-color);

    pre {
      margin: 0;
      font-size: var(--dcc-font-size-xs);
      white-space: pre-wrap;
      word-break: break-all;
      color: var(--dcc-text-primary);
    }

    .stage-creatives {
      margin-bottom: var(--dcc-spacing-sm);

      .creatives-label {
        font-size: var(--dcc-font-size-xs);
        color: var(--dcc-text-secondary);
        margin-bottom: var(--dcc-spacing-sm);
      }

      .creative-mini-item {
        display: flex;
        align-items: center;
        gap: var(--dcc-spacing-sm);
        padding: var(--dcc-spacing-xs) 0;
        border-bottom: 1px solid var(--dcc-border-color);

        &:last-child {
          border-bottom: none;
        }

        .creative-mini-title {
          font-size: var(--dcc-font-size-xs);
          color: var(--dcc-text-primary);
        }
      }
    }

    .empty-output {
      color: var(--dcc-text-secondary);
      font-size: var(--dcc-font-size-xs);
      font-style: italic;
      text-align: center;
      padding: var(--dcc-spacing-md);
    }
  }

  .stage-action {
    margin-top: var(--dcc-spacing-md);
    padding: var(--dcc-spacing-md);
    background: hsla(190 100% 50% / 0.08);
    border: 1px solid hsla(190 100% 50% / 0.3);
    border-radius: var(--dcc-radius-md);

    .stage-input {
      margin-bottom: var(--dcc-spacing-md);
    }

    .stage-action-buttons {
      display: flex;
      justify-content: flex-end;
    }
  }
}

.creatives-card {
  .creatives-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.creative-list {
  max-height: 600px;
  overflow-y: auto;
}

.creative-item {
  padding: var(--dcc-spacing-md);
  border-bottom: 1px solid var(--dcc-border-color);
  background: hsla(222 47% 14% / 0.3);
  border-radius: var(--dcc-radius-md);
  margin-bottom: var(--dcc-spacing-sm);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .creative-header {
    display: flex;
    gap: var(--dcc-spacing-sm);
    margin-bottom: var(--dcc-spacing-sm);
  }

  .creative-title {
    font-weight: 600;
    margin-bottom: var(--dcc-spacing-sm);
    color: var(--dcc-text-primary);
  }

  .creative-content {
    background: hsla(222 47% 12% / 0.5);
    padding: var(--dcc-spacing-md);
    border-radius: var(--dcc-radius-sm);
    margin-bottom: var(--dcc-spacing-sm);
    font-size: var(--dcc-font-size-xs);
    border: 1px solid var(--dcc-border-color);

    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
      color: var(--dcc-text-primary);
    }
  }

  .creative-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .creative-time {
      color: var(--dcc-text-secondary);
      font-size: var(--dcc-font-size-xs);
    }
    
    .creative-actions {
      display: flex;
      gap: var(--dcc-spacing-sm);
    }
  }
  
  .creative-image {
    max-width: 100%;
    max-height: 150px;
    border-radius: var(--dcc-radius-sm);
    object-fit: contain;
  }
}

.empty-creatives {
  padding: 40px 0;
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
  
  .el-input__wrapper,
  .el-textarea__inner {
    background: var(--dcc-bg-input);
    border-color: var(--dcc-border-color);
    color: var(--dcc-text-primary);
  }
}

// Element Plus 覆盖
:deep(.el-tag) {
  border: none;
  
  &.el-tag--success {
    background: hsla(160 80% 45% / 0.15);
    color: var(--dcc-accent-green);
  }
  
  &.el-tag--warning {
    background: hsla(38 92% 50% / 0.15);
    color: var(--dcc-accent-orange);
  }
  
  &.el-tag--danger {
    background: hsla(0 84% 60% / 0.15);
    color: var(--dcc-accent-red);
  }
  
  &.el-tag--info {
    background: hsla(210 40% 50% / 0.15);
    color: var(--dcc-text-secondary);
  }
  
  &.el-tag--primary {
    background: hsla(190 100% 50% / 0.15);
    color: var(--dcc-accent-cyan);
  }
}

.ai-result {
  margin-top: var(--dcc-spacing-lg);
  border: 1px solid var(--dcc-border-color);
  border-radius: var(--dcc-radius-md);
  overflow: hidden;
  
  .ai-result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--dcc-spacing-md);
    background: hsla(222 47% 14% / 0.8);
    border-bottom: 1px solid var(--dcc-border-color);
    
    span {
      color: var(--dcc-text-primary);
      font-weight: 600;
    }
  }
  
  .ai-result-content {
    padding: var(--dcc-spacing-md);
    background: hsla(222 47% 12% / 0.5);
    max-height: 300px;
    overflow-y: auto;
    
    pre {
      margin: 0;
      color: var(--dcc-text-primary);
      white-space: pre-wrap;
      word-break: break-all;
    }
    
    &.ai-image-preview {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: var(--dcc-spacing-lg);
      
      img {
        max-width: 100%;
        max-height: 250px;
        border-radius: var(--dcc-radius-md);
        box-shadow: 0 0 20px hsla(190 100% 50% / 0.3);
      }
    }
  }
}
</style>
