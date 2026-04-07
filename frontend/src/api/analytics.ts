import apiClient from './auth'

export interface AnalyticsMetrics {
  impressions: number
  clicks: number
  conversions: number
  spend: number
  ctr: number
  conversionRate: number
  cpa: number
}

export interface ChannelComparison {
  source: string
  impressions: number
  clicks: number
  conversions: number
  spend: number
  ctr: number
  conversionRate: number
  cpa: number
}

export interface Recommendations {
  recommendations: string[]
  priority: 'high' | 'medium' | 'low'
}

export const analyticsApi = {
  // 获取任务核心指标
  getMetrics: async (taskId: string): Promise<AnalyticsMetrics> => {
    const response = await apiClient.get(`/analytics/${taskId}/metrics`)
    return response.data
  },

  // 获取渠道对比数据
  getChannelComparison: async (taskId: string): Promise<ChannelComparison[]> => {
    const response = await apiClient.get(`/analytics/${taskId}/channel-comparison`)
    return response.data
  },

  // 获取优化建议
  getRecommendations: async (taskId: string): Promise<Recommendations> => {
    const response = await apiClient.get(`/analytics/${taskId}/recommendations`)
    return response.data
  },
}
