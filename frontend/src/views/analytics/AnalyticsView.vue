<template>
  <div class="analytics-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>返回
        </el-button>
        <h1>效果分析</h1>
      </div>
      <div class="header-right">
        <el-select
          v-model="selectedTaskId"
          placeholder="选择任务"
          style="width: 200px"
          @change="handleTaskChange"
        >
          <el-option
            v-for="task in taskList"
            :key="task.id"
            :label="task.name"
            :value="task.id"
          />
        </el-select>
        <el-button type="primary" @click="loadData" :loading="loading">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </div>

    <div v-if="!selectedTaskId" class="empty-state">
      <el-empty description="请选择一个任务查看效果分析" />
    </div>

    <template v-else>
      <!-- 核心指标卡片 -->
      <el-row :gutter="20" class="metrics-row">
        <el-col :span="4">
          <el-card class="metric-card">
            <div class="metric-label">曝光量</div>
            <div class="metric-value">{{ formatNumber(metrics.impressions) }}</div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="metric-card">
            <div class="metric-label">点击量</div>
            <div class="metric-value">{{ formatNumber(metrics.clicks) }}</div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="metric-card">
            <div class="metric-label">转化数</div>
            <div class="metric-value">{{ formatNumber(metrics.conversions) }}</div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="metric-card">
            <div class="metric-label">点击率 (CTR)</div>
            <div class="metric-value">{{ metrics.ctr }}%</div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="metric-card">
            <div class="metric-label">转化率</div>
            <div class="metric-value">{{ metrics.conversionRate }}%</div>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card class="metric-card">
            <div class="metric-label">花费 (CPA)</div>
            <div class="metric-value">¥{{ metrics.cpa }}</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 渠道对比和优化建议 -->
      <el-row :gutter="20" class="content-row">
        <el-col :span="16">
          <el-card class="channel-card" v-loading="loading">
            <template #header>
              <span>渠道对比</span>
            </template>
            <div ref="channelChart" class="chart-container"></div>
            <el-table :data="channelComparison" style="width: 100%; margin-top: 20px">
              <el-table-column prop="source" label="渠道" />
              <el-table-column prop="impressions" label="曝光量">
                <template #default="{ row }">{{ formatNumber(row.impressions) }}</template>
              </el-table-column>
              <el-table-column prop="clicks" label="点击量">
                <template #default="{ row }">{{ formatNumber(row.clicks) }}</template>
              </el-table-column>
              <el-table-column prop="ctr" label="CTR">
                <template #default="{ row }">{{ row.ctr }}%</template>
              </el-table-column>
              <el-table-column prop="conversions" label="转化数">
                <template #default="{ row }">{{ formatNumber(row.conversions) }}</template>
              </el-table-column>
              <el-table-column prop="conversionRate" label="转化率">
                <template #default="{ row }">{{ row.conversionRate }}%</template>
              </el-table-column>
              <el-table-column prop="spend" label="花费">
                <template #default="{ row }">¥{{ row.spend }}</template>
              </el-table-column>
              <el-table-column prop="cpa" label="CPA">
                <template #default="{ row }">¥{{ row.cpa }}</template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="recommendations-card" v-loading="loading">
            <template #header>
              <span>优化建议</span>
              <el-tag :type="getPriorityType(recommendations.priority)" size="small">
                {{ getPriorityLabel(recommendations.priority) }}
              </el-tag>
            </template>
            <div v-if="recommendations.recommendations?.length === 0" class="empty-recommendations">
              <el-empty description="暂无优化建议" />
            </div>
            <div v-else class="recommendations-list">
              <div
                v-for="(item, index) in recommendations.recommendations"
                :key="index"
                class="recommendation-item"
              >
                <el-icon class="recommendation-icon"><InfoFilled /></el-icon>
                <span class="recommendation-text">{{ item }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Refresh, InfoFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { analyticsApi, marketingTasksApi } from '@/api'
import type { AnalyticsMetrics, ChannelComparison, Recommendations, MarketingTask } from '@/api'

const route = useRoute()

const loading = ref(false)
const selectedTaskId = ref<string>('')
const taskList = ref<MarketingTask[]>([])

const metrics = ref<AnalyticsMetrics>({
  impressions: 0,
  clicks: 0,
  conversions: 0,
  spend: 0,
  ctr: 0,
  conversionRate: 0,
  cpa: 0,
})

const channelComparison = ref<ChannelComparison[]>([])
const recommendations = ref<Recommendations>({
  recommendations: [],
  priority: 'low',
})

const channelChart = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// 获取优先级类型
const getPriorityType = (priority: string) => {
  const map: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'success',
  }
  return map[priority] || 'info'
}

// 获取优先级标签
const getPriorityLabel = (priority: string) => {
  const map: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级',
  }
  return map[priority] || priority
}

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

// 初始化渠道对比图表
const initChannelChart = () => {
  if (!channelChart.value || channelComparison.value.length === 0) return
  
  chartInstance = echarts.init(channelChart.value)
  
  const sources = channelComparison.value.map(c => c.source)
  const clicks = channelComparison.value.map(c => c.clicks)
  const conversions = channelComparison.value.map(c => c.conversions)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['点击量', '转化数'],
    },
    xAxis: {
      type: 'category',
      data: sources,
    },
    yAxis: [
      {
        type: 'value',
        name: '点击量',
      },
      {
        type: 'value',
        name: '转化数',
      },
    ],
    series: [
      {
        name: '点击量',
        type: 'bar',
        data: clicks,
        itemStyle: { color: '#409eff' },
      },
      {
        name: '转化数',
        type: 'bar',
        yAxisIndex: 1,
        data: conversions,
        itemStyle: { color: '#67c23a' },
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
  }
  
  chartInstance.setOption(option)
}

// 加载任务列表
const loadTaskList = async () => {
  try {
    const res = await marketingTasksApi.getTasks({ pageSize: 100 })
    taskList.value = res.data
    
    // 如果有路由参数，自动选择
    const taskId = route.params.taskId as string
    if (taskId) {
      selectedTaskId.value = taskId
      loadData()
    }
  } catch (error) {
    console.error(error)
  }
}

// 加载分析数据
const loadData = async () => {
  if (!selectedTaskId.value) return
  
  loading.value = true
  try {
    const [metricsRes, channelsRes, recommendationsRes] = await Promise.all([
      analyticsApi.getMetrics(selectedTaskId.value),
      analyticsApi.getChannelComparison(selectedTaskId.value),
      analyticsApi.getRecommendations(selectedTaskId.value),
    ])
    
    metrics.value = metricsRes
    channelComparison.value = channelsRes
    recommendations.value = recommendationsRes
    
    // 初始化图表
    setTimeout(() => {
      initChannelChart()
    }, 100)
  } catch (error) {
    ElMessage.error('加载分析数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 切换任务
const handleTaskChange = () => {
  loadData()
}

// 窗口大小改变时重新渲染图表
const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  loadTaskList()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped lang="scss">
@use '@/styles/digital-command-center.scss' as dcc;

.analytics-view {
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

.empty-state {
  padding: 60px 0;
}

.metrics-row {
  margin-bottom: var(--dcc-spacing-lg);
}

.metric-card {
  @include dcc.glass-card;
  text-align: center;
  padding: var(--dcc-spacing-md);

  :deep(.el-card__header) {
    color: var(--dcc-text-secondary);
    font-size: var(--dcc-font-size-sm);
    font-weight: 500;
    border-bottom: 1px solid var(--dcc-border-color);
    padding: var(--dcc-spacing-sm) var(--dcc-spacing-md);
  }

  .metric-label {
    color: var(--dcc-text-secondary);
    font-size: var(--dcc-font-size-sm);
    margin-bottom: var(--dcc-spacing-sm);
  }

  .metric-value {
    font-size: 32px;
    font-weight: 700;
    background: var(--dcc-gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.content-row {
  margin-bottom: var(--dcc-spacing-lg);
}

.channel-card {
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

.recommendations-card {
  @include dcc.glass-card;
  
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

  .recommendations-list {
    .recommendation-item {
      display: flex;
      align-items: flex-start;
      gap: var(--dcc-spacing-sm);
      padding: var(--dcc-spacing-md);
      background: hsla(222 47% 14% / 0.5);
      border-radius: var(--dcc-radius-sm);
      margin-bottom: var(--dcc-spacing-sm);
      border: 1px solid var(--dcc-border-color);

      &:last-child {
        margin-bottom: 0;
      }

      .recommendation-icon {
        color: var(--dcc-accent-orange);
        font-size: 18px;
        margin-top: 2px;
      }

      .recommendation-text {
        flex: 1;
        line-height: 1.5;
        color: var(--dcc-text-primary);
      }
    }
  }
}

.empty-recommendations {
  padding: 40px 0;
}

// Element Plus 覆盖
:deep(.el-select .el-input__wrapper) {
  background: var(--dcc-bg-input);
  border-color: var(--dcc-border-color);
  box-shadow: none;
}

:deep(.el-select .el-input__inner) {
  color: var(--dcc-text-primary);
}

:deep(.el-empty__description) {
  color: var(--dcc-text-secondary);
}
</style>
