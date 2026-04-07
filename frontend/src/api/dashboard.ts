import apiClient from './auth'

export interface DashboardMetrics {
  totalTasks: number
  activeTasks: number
  completedTasks: number
  completionRate: number
  totalCreatives: number
  publishedCreatives: number
}

export interface TrendData {
  dates: string[]
  taskCounts: number[]
}

export interface RecentTask {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
  _count?: {
    stages: number
    creatives: number
  }
}

export const dashboardApi = {
  // 获取核心指标
  getMetrics: async (): Promise<DashboardMetrics> => {
    const response = await apiClient.get('/dashboard/metrics')
    return response.data
  },

  // 获取趋势数据
  getTrend: async (days?: number): Promise<TrendData> => {
    const response = await apiClient.get('/dashboard/trend', {
      params: { days },
    })
    return response.data
  },

  // 获取最近任务
  getRecentTasks: async (limit?: number): Promise<RecentTask[]> => {
    const response = await apiClient.get('/dashboard/recent-tasks', {
      params: { limit },
    })
    return response.data
  },
}
