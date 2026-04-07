<template>
  <div class="dashboard-view">
    <h1>营销仪表盘</h1>
    
    <!-- 核心指标卡片 -->
    <el-row :gutter="20" class="metrics-row">
      <el-col :span="6">
        <el-card class="metric-card">
          <template #header>
            <span>总任务数</span>
          </template>
          <div class="stat-number">{{ metrics.totalTasks }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metric-card">
          <template #header>
            <span>进行中</span>
          </template>
          <div class="stat-number active">{{ metrics.activeTasks }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metric-card">
          <template #header>
            <span>已完成</span>
          </template>
          <div class="stat-number success">{{ metrics.completedTasks }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="metric-card">
          <template #header>
            <span>完成率</span>
          </template>
          <div class="stat-number">{{ metrics.completionRate }}%</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图表和最近任务 -->
    <el-row :gutter="20" class="content-row">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <span>任务创建趋势（近30天）</span>
          </template>
          <div ref="trendChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="recent-tasks-card">
          <template #header>
            <span>最近任务</span>
            <el-button link type="primary" @click="$router.push('/tasks')">查看全部</el-button>
          </template>
          <el-table :data="recentTasks" style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="任务名称" show-overflow-tooltip>
              <template #default="{ row }">
                <el-link type="primary" @click="$router.push(`/tasks/${row.id}`)">{{ row.name }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="100">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创意统计 -->
    <el-row :gutter="20" class="content-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>创意统计</span>
          </template>
          <el-row>
            <el-col :span="12" class="creative-stat">
              <div class="stat-label">总创意数</div>
              <div class="stat-value">{{ metrics.totalCreatives }}</div>
            </el-col>
            <el-col :span="12" class="creative-stat">
              <div class="stat-label">已发布</div>
              <div class="stat-value success">{{ metrics.publishedCreatives }}</div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>快速操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/tasks')">
              <el-icon><Plus /></el-icon>新建任务
            </el-button>
            <el-button @click="$router.push('/creatives')">
              <el-icon><Picture /></el-icon>创意库
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Picture } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { dashboardApi } from '@/api'
import type { DashboardMetrics, RecentTask, TrendData } from '@/api'

const loading = ref(false)
const metrics = ref<DashboardMetrics>({
  totalTasks: 0,
  activeTasks: 0,
  completedTasks: 0,
  completionRate: 0,
  totalCreatives: 0,
  publishedCreatives: 0,
})
const recentTasks = ref<RecentTask[]>([])
const trendData = ref<TrendData>({ dates: [], taskCounts: [] })
const trendChart = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    draft: 'info',
    active: 'warning',
    completed: 'success',
    paused: 'danger',
  }
  return map[status] || 'info'
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    active: '进行中',
    completed: '已完成',
    paused: '已暂停',
  }
  return map[status] || status
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 初始化趋势图表
const initTrendChart = () => {
  if (!trendChart.value) return
  
  chartInstance = echarts.init(trendChart.value)
  const option = {
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: trendData.value.dates,
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    series: [
      {
        data: trendData.value.taskCounts,
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
            ],
          },
        },
        itemStyle: {
          color: '#409eff',
        },
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
  }
  chartInstance.setOption(option)
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const [metricsRes, recentTasksRes, trendRes] = await Promise.all([
      dashboardApi.getMetrics(),
      dashboardApi.getRecentTasks(5),
      dashboardApi.getTrend(30),
    ])
    metrics.value = metricsRes
    recentTasks.value = recentTasksRes
    trendData.value = trendRes
    
    // 初始化图表
    setTimeout(() => {
      initTrendChart()
    }, 100)
  } catch (error) {
    ElMessage.error('加载仪表盘数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 窗口大小改变时重新渲染图表
const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped lang="scss">
@use '@/styles/digital-command-center.scss' as dcc;

.dashboard-view {
  @include dcc.page-container;
  
  h1 {
    @include dcc.page-title;
    margin-bottom: var(--dcc-spacing-lg);
  }
}

.metrics-row {
  margin-bottom: var(--dcc-spacing-lg);
}

.metric-card {
  @include dcc.glass-card;
  
  :deep(.el-card__header) {
    color: var(--dcc-text-secondary);
    font-size: var(--dcc-font-size-sm);
    font-weight: 500;
    border-bottom: 1px solid var(--dcc-border-color);
    padding: var(--dcc-spacing-md) var(--dcc-spacing-lg);
  }
  
  .stat-number {
    font-size: 42px;
    font-weight: 700;
    text-align: center;
    background: var(--dcc-gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    padding: var(--dcc-spacing-md) 0;
    
    &.active {
      background: linear-gradient(135deg, var(--dcc-accent-orange) 0%, #fbbf24 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    &.success {
      background: var(--dcc-gradient-success);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
}

.content-row {
  margin-bottom: var(--dcc-spacing-lg);
}

.chart-card {
  @include dcc.glass-card;
  
  :deep(.el-card__header) {
    color: var(--dcc-text-primary);
    font-size: var(--dcc-font-size-lg);
    font-weight: 600;
    border-bottom: 1px solid var(--dcc-border-color);
    padding: var(--dcc-spacing-md) var(--dcc-spacing-lg);
  }
  
  .chart-container {
    height: 320px;
  }
}

.recent-tasks-card {
  @include dcc.glass-card;
  height: 100%;
  
  :deep(.el-card__header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--dcc-text-primary);
    font-size: var(--dcc-font-size-lg);
    font-weight: 600;
    border-bottom: 1px solid var(--dcc-border-color);
    padding: var(--dcc-spacing-md) var(--dcc-spacing-lg);
  }
  
  :deep(.el-table) {
    background: transparent;
    
    th.el-table__cell {
      background: hsla(222 47% 14% / 0.5);
      color: var(--dcc-text-secondary);
      font-weight: 500;
      border-bottom: 1px solid var(--dcc-border-color);
    }
    
    td.el-table__cell {
      background: transparent;
      color: var(--dcc-text-primary);
      border-bottom: 1px solid var(--dcc-border-color);
    }
    
    tr:hover > td.el-table__cell {
      background: hsla(190 100% 50% / 0.05);
    }
  }
}

.creative-stat {
  text-align: center;
  padding: var(--dcc-spacing-lg);
  
  .stat-label {
    color: var(--dcc-text-secondary);
    margin-bottom: var(--dcc-spacing-sm);
    font-size: var(--dcc-font-size-sm);
  }
  
  .stat-value {
    font-size: 36px;
    font-weight: 700;
    background: var(--dcc-gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    
    &.success {
      background: var(--dcc-gradient-success);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
}

.quick-actions {
  display: flex;
  gap: var(--dcc-spacing-md);
  padding: var(--dcc-spacing-lg);
  
  .el-button {
    flex: 1;
    height: 64px;
    font-size: var(--dcc-font-size-lg);
    font-weight: 500;
    @include dcc.gradient-button;
    border-radius: var(--dcc-radius-md);
    
    .el-icon {
      margin-right: var(--dcc-spacing-sm);
      font-size: 20px;
    }
    
    &:nth-child(2) {
      background: linear-gradient(135deg, var(--dcc-accent-purple) 0%, #c084fc 100%);
    }
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
  
  &.el-tag--info {
    background: hsla(210 40% 50% / 0.15);
    color: var(--dcc-text-secondary);
  }
}

:deep(.el-link.el-link--primary) {
  color: var(--dcc-accent-cyan);
  
  &:hover {
    color: var(--dcc-accent-purple);
  }
}
</style>
