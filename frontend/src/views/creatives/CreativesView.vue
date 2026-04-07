<template>
  <div class="task-detail-view">
    <!-- 任务标题 -->
    <div class="task-header">
      <h1>{{ currentTask?.name || '网球拍知名度 曝光量100万次' }}</h1>
      <p class="task-subtitle">{{ currentTask?.description || '网球拍知名度 曝光量100万次' }}</p>
    </div>

    <!-- 执行进度 -->
    <el-card class="progress-card">
      <div class="progress-header">
        <h3>执行进度</h3>
        <el-tag :type="getStatusType(currentTask?.status)">{{ getStatusLabel(currentTask?.status) }}</el-tag>
      </div>
      
      <div class="progress-info">
        <div class="progress-bar-wrapper">
          <el-progress :percentage="progressPercentage" :stroke-width="20" :color="progressColors" />
          <div class="progress-stats">
            <span>预算: ¥{{ currentTask?.budget || 10000 }}</span>
            <span>周期: {{ formatDate(currentTask?.startDate) }} ~ {{ formatDate(currentTask?.endDate) }}</span>
            <span>预估成本: ¥{{ estimatedCost }}</span>
            <span>预估时长: {{ estimatedDuration }}分钟</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 阶段输出 -->
    <el-card class="stages-card">
      <h3>阶段输出</h3>
      <div class="stages-timeline">
        <div
          v-for="(stage, index) in stages"
          :key="stage.key"
          class="stage-item"
          :class="{ 'stage-active': currentStage === stage.key, 'stage-completed': isStageCompleted(stage.key) }"
        >
          <div class="stage-marker">
            <div class="stage-dot" :class="`stage-${stage.status}`">
              <el-icon v-if="stage.status === 'completed'"><Check /></el-icon>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div v-if="index < stages.length - 1" class="stage-line" :class="`line-${stage.status}`"></div>
          </div>
          
          <div class="stage-content">
            <div class="stage-header-row">
              <span class="stage-name">{{ stage.name }}</span>
              <el-tag :type="getStageStatusType(stage.status)" size="small">{{ getStageStatusLabel(stage.status) }}</el-tag>
              <span class="stage-duration">¥{{ stage.cost }} · {{ stage.duration }}分钟</span>
            </div>
            
            <!-- 阶段内容编辑区 -->
            <div v-if="currentStage === stage.key || stage.status === 'completed'" class="stage-editor">
              <el-input
                v-model="stage.content"
                type="textarea"
                :rows="4"
                :placeholder="`请输入${stage.name}内容...`"
                :disabled="stage.status === 'completed'"
              />
              
              <div v-if="stage.status === 'completed' && stage.output" class="stage-output">
                <div class="output-label">阶段产出:</div>
                <div class="output-content">{{ stage.output }}</div>
              </div>
            </div>
            
            <!-- 推进按钮 -->
            <div v-if="currentStage === stage.key && stage.status === 'processing'" class="stage-actions">
              <el-button type="primary" @click="advanceStage(stage)">
                <el-icon><ArrowRight /></el-icon>
                推进阶段
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 创意生成 -->
    <el-card class="creative-gen-card">
      <h3>创意生成</h3>
      <el-tabs v-model="activeCreativeTab">
        <!-- 生成文案 -->
        <el-tab-pane label="生成文案" name="text">
          <div class="creative-gen-section">
            <div class="input-group">
              <el-input
                v-model="textPrompt"
                type="textarea"
                :rows="3"
                placeholder="请输入文案生成提示词，例如：为网球拍产品生成一个吸引人的广告标题..."
              />
              <el-button type="primary" :loading="generatingText" @click="generateText">
                <el-icon><MagicStick /></el-icon>
                生成文案
              </el-button>
            </div>
            
            <!-- 生成的文案结果 -->
            <div v-if="generatedTexts.length > 0" class="generated-results">
              <h4>生成结果</h4>
              <div v-for="(text, idx) in generatedTexts" :key="idx" class="generated-item">
                <div class="generated-content">{{ text }}</div>
                <div class="generated-actions">
                  <el-button type="primary" size="small" @click="saveCreative('text', text)">
                    保存到广告创意
                  </el-button>
                  <el-button size="small" @click="copyText(text)">复制</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 生成图片 -->
        <el-tab-pane label="生成图片" name="image">
          <div class="creative-gen-section">
            <div class="input-group">
              <el-input
                v-model="imagePrompt"
                type="textarea"
                :rows="3"
                placeholder="请输入图片描述，例如：一个专业网球运动员正在使用网球拍击球的场景..."
              />
              <div class="image-options">
                <el-select v-model="imageStyle" placeholder="选择风格" style="width: 120px">
                  <el-option label="现代简约" value="modern" />
                  <el-option label="写实风格" value="realistic" />
                  <el-option label="艺术插画" value="artistic" />
                  <el-option label="产品展示" value="product" />
                </el-select>
                <el-select v-model="imageRatio" placeholder="比例" style="width: 100px">
                  <el-option label="1:1" value="1:1" />
                  <el-option label="16:9" value="16:9" />
                  <el-option label="9:16" value="9:16" />
                  <el-option label="4:3" value="4:3" />
                </el-select>
                <el-button type="primary" :loading="generatingImage" @click="generateImage">
                  <el-icon><Picture /></el-icon>
                  生成图片
                </el-button>
              </div>
            </div>
            
            <!-- 生成的图片结果 -->
            <div v-if="generatedImages.length > 0" class="generated-results">
              <h4>生成结果</h4>
              <div class="image-grid">
                <div v-for="(img, idx) in generatedImages" :key="idx" class="generated-image-item">
                  <el-image :src="img.url" fit="cover" :preview-src-list="generatedImages.map(i => i.url)" />
                  <div class="generated-actions">
                    <el-button type="primary" size="small" @click="saveCreative('image', img.url)">
                      保存到广告创意
                    </el-button>
                    <el-button size="small" @click="downloadImage(img.url)">下载</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 广告创意列表 -->
    <el-card class="creatives-list-card">
      <div class="creatives-header">
        <h3>广告创意 ({{ creatives.length }})</h3>
        <el-radio-group v-model="creativeFilter" size="small">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="text">文案</el-radio-button>
          <el-radio-button label="image">图片</el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="creatives-grid">
        <div
          v-for="creative in filteredCreatives"
          :key="creative.id"
          class="creative-item"
          :class="`creative-${creative.type}`"
        >
          <div class="creative-type-tag">
            <el-tag :type="creative.type === 'text' ? 'primary' : 'success'" size="small">
              {{ creative.type === 'text' ? '文案' : '图片' }}
            </el-tag>
          </div>
          
          <div class="creative-body">
            <template v-if="creative.type === 'text'">
              <p class="creative-text">{{ creative.content }}</p>
            </template>
            <template v-else>
              <el-image :src="creative.content" fit="cover" class="creative-image" />
            </template>
          </div>
          
          <div class="creative-footer">
            <span class="creative-time">{{ formatTime(creative.createdAt) }}</span>
            <el-button type="danger" link size="small" @click="deleteCreative(creative.id)">
              删除
            </el-button>
          </div>
        </div>
      </div>
      
      <el-empty v-if="filteredCreatives.length === 0" description="暂无创意，请在上方生成" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Check,
  ArrowRight,
  MagicStick,
  Picture,
} from '@element-plus/icons-vue'
import { marketingTasksApi, aiApi } from '@/api'

const route = useRoute()

// 当前任务
const currentTask = ref<any>(null)
const taskId = computed(() => route.params.id as string || 'default-task')

// 进度相关
const progressPercentage = ref(25)
const estimatedCost = ref(960)
const estimatedDuration = ref(480)
const progressColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 },
]

// 阶段数据
const currentStage = ref('data_collection')
const stages = ref<any[]>([])

// 阶段定义
const stageDefinitions = [
  { key: 'data_collection', name: '数据采集', cost: 50, duration: 30 },
  { key: 'market_analysis', name: '市场分析', cost: 100, duration: 40 },
  { key: 'strategy_generation', name: '策略生成', cost: 150, duration: 45 },
  { key: 'activity_planning', name: '活动规划', cost: 200, duration: 60 },
  { key: 'creative_design', name: '创意设计', cost: 250, duration: 90 },
  { key: 'execution_delivery', name: '执行投放', cost: 120, duration: 30 },
  { key: 'effect_analysis', name: '效果分析', cost: 100, duration: 60 },
  { key: 'optimization_iteration', name: '优化迭代', cost: 150, duration: 45 },
]

// 初始化阶段数据
function initStages(taskStages: any[] = []) {
  const stageMap = new Map(taskStages.map(s => [s.stage, s]))
  
  stages.value = stageDefinitions.map((def, index) => {
    const existingStage = stageMap.get(def.key)
    const isCompleted = existingStage?.status === 'completed'
    const isProcessing = existingStage?.status === 'processing'
    const isPending = !existingStage || existingStage.status === 'pending'
    
    // 找到第一个未完成的阶段作为当前阶段
    if (isProcessing || (isPending && !currentStage.value)) {
      currentStage.value = def.key
    }
    
    return {
      key: def.key,
      name: def.name,
      status: existingStage?.status || 'pending',
      cost: def.cost,
      duration: def.duration,
      content: existingStage?.output || '',
      output: existingStage?.output || '',
      startedAt: existingStage?.startedAt,
      completedAt: existingStage?.completedAt,
    }
  })
  
  // 如果没有设置当前阶段，默认第一个
  if (!currentStage.value && stages.value.length > 0) {
    currentStage.value = stages.value[0].key
    stages.value[0].status = 'processing'
  }
  
  // 更新进度
  const completedCount = stages.value.filter(s => s.status === 'completed').length
  progressPercentage.value = Math.round((completedCount / stages.value.length) * 100)
}

// 创意生成相关
const activeCreativeTab = ref('text')
const textPrompt = ref('')
const imagePrompt = ref('')
const imageStyle = ref('modern')
const imageRatio = ref('16:9')
const generatingText = ref(false)
const generatingImage = ref(false)
const generatedTexts = ref<string[]>([])
const generatedImages = ref<{url: string}[]>([])

// 创意列表
const creatives = ref<any[]>([])
const creativeFilter = ref('all')
const filteredCreatives = computed(() => {
  if (creativeFilter.value === 'all') return creatives.value
  return creatives.value.filter(c => c.type === creativeFilter.value)
})

// 判断阶段是否完成
function isStageCompleted(stageKey: string) {
  const stageIndex = stages.value.findIndex(s => s.key === stageKey)
  const currentIndex = stages.value.findIndex(s => s.key === currentStage.value)
  return stageIndex < currentIndex
}

// 获取阶段状态类型
function getStageStatusType(status: string) {
  const types: Record<string, string> = {
    completed: 'success',
    processing: 'primary',
    pending: 'info',
  }
  return types[status] || 'info'
}

// 获取阶段状态标签
function getStageStatusLabel(status: string) {
  const labels: Record<string, string> = {
    completed: '已完成',
    processing: '进行中',
    pending: '待开始',
  }
  return labels[status] || '待开始'
}

// 获取任务状态类型
function getStatusType(status: string | undefined) {
  const types: Record<string, string> = {
    active: 'success',
    draft: 'info',
    completed: 'primary',
    paused: 'warning',
  }
  return types[status || 'draft'] || 'info'
}

// 获取任务状态标签
function getStatusLabel(status: string | undefined) {
  const labels: Record<string, string> = {
    active: '进行中',
    draft: '草稿',
    completed: '已完成',
    paused: '已暂停',
  }
  return labels[status || 'draft'] || '草稿'
}

// 格式化日期
function formatDate(date: string | undefined) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 格式化时间
function formatTime(time: string) {
  return new Date(time).toLocaleString('zh-CN')
}

// 推进阶段
async function advanceStage(stage: any) {
  try {
    if (!stage.content.trim()) {
      ElMessage.warning('请先填写阶段内容')
      return
    }
    
    // 调用API推进阶段
    await marketingTasksApi.advanceStage(taskId.value, {
      stage: stage.key,
      output: stage.content,
    })
    
    // 更新阶段状态
    stage.status = 'completed'
    stage.output = stage.content
    
    // 找到下一个阶段并激活
    const currentIndex = stages.value.findIndex(s => s.key === stage.key)
    if (currentIndex < stages.value.length - 1) {
      const nextStage = stages.value[currentIndex + 1]
      nextStage.status = 'processing'
      currentStage.value = nextStage.key
    }
    
    // 更新进度
    const completedCount = stages.value.filter(s => s.status === 'completed').length
    progressPercentage.value = Math.round((completedCount / stages.value.length) * 100)
    
    ElMessage.success('阶段推进成功')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '阶段推进失败')
  }
}

// 生成文案
async function generateText() {
  if (!textPrompt.value.trim()) {
    ElMessage.warning('请输入文案生成提示词')
    return
  }
  
  generatingText.value = true
  try {
    const res = await aiApi.generateText({
      prompt: textPrompt.value,
      type: 'marketing_copy',
    })
    
    // 假设返回的是文案数组
    generatedTexts.value = res.data?.texts || [
      '🔥 从一个网球巨星，从这一拍开始！',
      '✨ 正文：还在找那支能让你挥洒自如的网球拍？看这里！',
      '🎯 专为热爱网球的你打造！',
    ]
    
    ElMessage.success('文案生成成功')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '文案生成失败')
    // 使用模拟数据
    generatedTexts.value = [
      '🔥 从一个网球巨星，从这一拍开始！',
      '✨ 还在找那支能让你挥洒自如的网球拍？看这里！',
      '🎯 专为热爱网球的你打造！',
    ]
  } finally {
    generatingText.value = false
  }
}

// 生成图片
async function generateImage() {
  if (!imagePrompt.value.trim()) {
    ElMessage.warning('请输入图片描述')
    return
  }
  
  generatingImage.value = true
  try {
    const res = await aiApi.generateImage({
      prompt: imagePrompt.value,
      style: imageStyle.value,
      ratio: imageRatio.value,
    })
    
    generatedImages.value = res.data?.images || [
      { url: 'https://via.placeholder.com/400x300/409eff/ffffff?text=Generated+Image+1' },
      { url: 'https://via.placeholder.com/400x300/67c23a/ffffff?text=Generated+Image+2' },
    ]
    
    ElMessage.success('图片生成成功')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '图片生成失败')
    // 使用模拟数据
    generatedImages.value = [
      { url: 'https://via.placeholder.com/400x300/409eff/ffffff?text=Generated+Image+1' },
      { url: 'https://via.placeholder.com/400x300/67c23a/ffffff?text=Generated+Image+2' },
    ]
  } finally {
    generatingImage.value = false
  }
}

// 保存创意
async function saveCreative(type: string, content: string) {
  try {
    // 调用API保存到后端
    const res = await marketingTasksApi.createCreative(taskId.value, {
      type: type === 'text' ? 'headline' : 'image',
      content: type === 'text' ? { text: content } : { url: content },
      aiGenerated: true,
    })
    
    // 添加到本地列表
    creatives.value.unshift({
      id: res.id,
      type: type,
      content: content,
      createdAt: res.createdAt,
    })
    
    ElMessage.success('已保存到广告创意')
  } catch (error: any) {
    console.error('保存创意失败:', error)
    ElMessage.error(error.response?.data?.message || '保存失败')
    
    // 临时保存到本地
    const creative = {
      id: Date.now().toString(),
      type,
      content,
      createdAt: new Date().toISOString(),
    }
    creatives.value.unshift(creative)
  }
}

// 删除创意
async function deleteCreative(id: string) {
  try {
    await ElMessageBox.confirm('确定删除该创意吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    creatives.value = creatives.value.filter(c => c.id !== id)
    ElMessage.success('删除成功')
  } catch {
    // 取消删除
  }
}

// 复制文本
function copyText(text: string) {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板')
}

// 下载图片
function downloadImage(url: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = `creative-${Date.now()}.png`
  link.click()
}

// 加载任务数据
async function loadTaskData() {
  try {
    if (taskId.value && taskId.value !== 'default-task') {
      // 获取任务详情
      const taskRes = await marketingTasksApi.getTask(taskId.value)
      currentTask.value = taskRes
      
      // 获取任务阶段
      const stagesRes = await marketingTasksApi.getTaskStages(taskId.value)
      initStages(stagesRes)
      
      // 获取任务创意
      const creativesRes = await marketingTasksApi.getTaskCreatives(taskId.value)
      creatives.value = creativesRes.map((c: any) => ({
        id: c.id,
        type: c.type,
        content: c.content,
        createdAt: c.createdAt,
      }))
    } else {
      // 默认初始化阶段
      initStages([])
    }
  } catch (error) {
    console.error('加载任务数据失败:', error)
    // 默认初始化阶段
    initStages([])
  }
}

onMounted(() => {
  loadTaskData()
})
</script>

<style scoped lang="scss">
// Digital Command Center 风格变量
$bg-primary: hsl(222 47% 11%);      // 深空蓝灰基底
$bg-secondary: hsl(222 47% 14%);    // 次级背景
$bg-card: hsla(222 47% 16% / 0.7);  // 玻璃态卡片背景
$border-color: hsla(210 40% 50% / 0.2);  // 边框色
$text-primary: #ffffff;             // 主文字
$text-secondary: hsl(215 25% 65%);  // 次级文字
$accent-cyan: #00d4ff;              // 电光青
$accent-purple: #a855f7;            // 电光紫
$accent-green: #10b981;             // 成功绿
$accent-orange: #f59e0b;            // 警告橙

.task-detail-view {
  padding: 24px;
  background: $bg-primary;
  min-height: 100vh;
  color: $text-primary;
  background-image: 
    radial-gradient(ellipse at 20% 20%, hsla(280 60% 50% / 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, hsla(190 80% 50% / 0.06) 0%, transparent 50%);
}

.task-header {
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid $border-color;
  
  h1 {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: $text-primary;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, $text-primary 0%, $accent-cyan 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .task-subtitle {
    color: $text-secondary;
    margin: 0;
    font-size: 14px;
  }
}

// 玻璃态卡片样式
.progress-card,
.stages-card,
.creative-gen-card,
.creatives-list-card {
  background: $bg-card;
  backdrop-filter: blur(20px);
  border: 1px solid $border-color;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 
    0 4px 6px -1px hsla(0 0% 0% / 0.1),
    0 2px 4px -1px hsla(0 0% 0% / 0.06),
    inset 0 1px 0 0 hsla(255 255% 255% / 0.05);
  
  :deep(.el-card__body) {
    padding: 24px;
  }
  
  h3 {
    margin: 0 0 20px 0;
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &::before {
      content: '';
      width: 4px;
      height: 18px;
      background: linear-gradient(180deg, $accent-cyan 0%, $accent-purple 100%);
      border-radius: 2px;
    }
  }
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.progress-bar-wrapper {
  :deep(.el-progress-bar__outer) {
    background-color: hsla(210 40% 50% / 0.15);
    border-radius: 10px;
  }
  
  :deep(.el-progress-bar__inner) {
    border-radius: 10px;
    background: linear-gradient(90deg, $accent-cyan 0%, $accent-purple 100%);
    box-shadow: 0 0 20px hsla(190 100% 50% / 0.4);
  }
  
  .progress-stats {
    display: flex;
    gap: 32px;
    margin-top: 16px;
    color: $text-secondary;
    font-size: 13px;
    
    span {
      display: flex;
      align-items: center;
      gap: 6px;
      
      &::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: $accent-cyan;
        box-shadow: 0 0 8px $accent-cyan;
      }
    }
  }
}

// 阶段时间线
.stages-timeline {
  padding-left: 8px;
}

.stage-item {
  display: flex;
  margin-bottom: 24px;
  position: relative;
}

.stage-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
}

.stage-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  z-index: 1;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  
  &.stage-pending {
    background: hsla(210 40% 50% / 0.15);
    color: $text-secondary;
    border-color: hsla(210 40% 50% / 0.3);
  }
  
  &.stage-processing {
    background: hsla(190 100% 50% / 0.15);
    color: $accent-cyan;
    border-color: $accent-cyan;
    box-shadow: 0 0 20px hsla(190 100% 50% / 0.4);
    animation: pulse-cyan 2s ease-in-out infinite;
  }
  
  &.stage-completed {
    background: hsla(160 80% 45% / 0.15);
    color: $accent-green;
    border-color: $accent-green;
    box-shadow: 0 0 12px hsla(160 80% 45% / 0.3);
  }
}

@keyframes pulse-cyan {
  0%, 100% { box-shadow: 0 0 20px hsla(190 100% 50% / 0.4); }
  50% { box-shadow: 0 0 30px hsla(190 100% 50% / 0.6); }
}

.stage-line {
  width: 2px;
  flex: 1;
  min-height: 60px;
  margin-top: 8px;
  
  &.line-pending {
    background: hsla(210 40% 50% / 0.15);
  }
  
  &.line-processing {
    background: linear-gradient(to bottom, $accent-cyan, hsla(210 40% 50% / 0.15));
  }
  
  &.line-completed {
    background: $accent-green;
    box-shadow: 0 0 8px hsla(160 80% 45% / 0.4);
  }
}

.stage-content {
  flex: 1;
  background: hsla(222 47% 18% / 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid $border-color;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: hsla(190 100% 50% / 0.3);
    box-shadow: 0 0 20px hsla(190 100% 50% / 0.1);
  }
}

.stage-header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  .stage-name {
    font-weight: 600;
    color: $text-primary;
    font-size: 15px;
  }
  
  .stage-duration {
    color: $text-secondary;
    font-size: 12px;
    margin-left: auto;
    padding: 4px 10px;
    background: hsla(210 40% 50% / 0.1);
    border-radius: 20px;
  }
}

.stage-editor {
  margin-bottom: 16px;
  
  :deep(.el-textarea__inner) {
    background: hsla(222 47% 12% / 0.8);
    border-color: $border-color;
    color: $text-primary;
    border-radius: 8px;
    
    &:focus {
      border-color: $accent-cyan;
      box-shadow: 0 0 0 2px hsla(190 100% 50% / 0.1);
    }
  }
}

.stage-output {
  margin-top: 16px;
  padding: 16px;
  background: hsla(160 80% 45% / 0.08);
  border: 1px solid hsla(160 80% 45% / 0.2);
  border-radius: 8px;
  
  .output-label {
    color: $accent-green;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .output-content {
    color: $text-primary;
    line-height: 1.7;
    font-size: 14px;
  }
}

.stage-actions {
  display: flex;
  justify-content: flex-end;
  
  :deep(.el-button--primary) {
    background: linear-gradient(135deg, $accent-cyan 0%, $accent-purple 100%);
    border: none;
    box-shadow: 0 4px 14px hsla(190 100% 50% / 0.3);
    
    &:hover {
      box-shadow: 0 6px 20px hsla(190 100% 50% / 0.5);
      transform: translateY(-1px);
    }
  }
}

// 创意生成
.creative-gen-section {
  .input-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
    
    :deep(.el-textarea__inner) {
      background: hsla(222 47% 12% / 0.8);
      border-color: $border-color;
      color: $text-primary;
      border-radius: 12px;
      
      &:focus {
        border-color: $accent-purple;
        box-shadow: 0 0 0 3px hsla(270 80% 60% / 0.1);
      }
    }
  }
  
  .image-options {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }
}

.generated-results {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid $border-color;
  
  h4 {
    margin: 0 0 20px 0;
    color: $text-primary;
    font-size: 15px;
    font-weight: 600;
  }
}

.generated-item {
  background: hsla(222 47% 18% / 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid $border-color;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: hsla(270 80% 60% / 0.3);
    box-shadow: 0 0 20px hsla(270 80% 60% / 0.1);
  }
  
  .generated-content {
    color: $text-primary;
    line-height: 1.7;
    margin-bottom: 16px;
    font-size: 15px;
  }
  
  .generated-actions {
    display: flex;
    gap: 10px;
  }
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.generated-image-item {
  background: hsla(222 47% 18% / 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid $border-color;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: hsla(270 80% 60% / 0.3);
    box-shadow: 0 0 20px hsla(270 80% 60% / 0.15);
    transform: translateY(-2px);
  }
  
  .el-image {
    width: 100%;
    height: 160px;
  }
  
  .generated-actions {
    padding: 16px;
    display: flex;
    gap: 10px;
  }
}

// 创意列表
.creatives-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.creatives-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.creative-item {
  background: hsla(222 47% 18% / 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid $border-color;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: hsla(190 100% 50% / 0.3);
    box-shadow: 0 0 20px hsla(190 100% 50% / 0.1);
    transform: translateY(-2px);
  }
}

.creative-type-tag {
  margin-bottom: 16px;
}

.creative-body {
  margin-bottom: 16px;
  
  .creative-text {
    color: $text-primary;
    line-height: 1.7;
    margin: 0;
    font-size: 15px;
  }
  
  .creative-image {
    width: 100%;
    height: 160px;
    border-radius: 8px;
    object-fit: cover;
  }
}

.creative-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid $border-color;
  
  .creative-time {
    color: $text-secondary;
    font-size: 12px;
  }
}

// Element Plus 深色主题覆盖
:deep(.el-tabs__item) {
  color: $text-secondary;
  font-weight: 500;
  
  &.is-active {
    color: $accent-cyan;
  }
  
  &:hover {
    color: $accent-cyan;
  }
}

:deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, $accent-cyan 0%, $accent-purple 100%);
  height: 3px;
  border-radius: 3px;
}

:deep(.el-radio-button__inner) {
  background: hsla(222 47% 16% / 0.6);
  border-color: $border-color;
  color: $text-secondary;
  
  &:hover {
    color: $accent-cyan;
  }
}

:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, $accent-cyan 0%, $accent-purple 100%);
  border-color: transparent;
  color: $text-primary;
  box-shadow: 0 0 12px hsla(190 100% 50% / 0.3);
}

:deep(.el-select .el-input__wrapper) {
  background: hsla(222 47% 16% / 0.6);
  border-color: $border-color;
  box-shadow: none;
}

:deep(.el-select .el-input__inner) {
  color: $text-primary;
}

:deep(.el-tag) {
  border: none;
  
  &.el-tag--success {
    background: hsla(160 80% 45% / 0.15);
    color: $accent-green;
  }
  
  &.el-tag--primary {
    background: hsla(190 100% 50% / 0.15);
    color: $accent-cyan;
  }
  
  &.el-tag--warning {
    background: hsla(38 92% 50% / 0.15);
    color: $accent-orange;
  }
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, $accent-cyan 0%, $accent-purple 100%);
  border: none;
  
  &:hover {
    opacity: 0.9;
  }
}

:deep(.el-empty__description) {
  color: $text-secondary;
}
</style>
