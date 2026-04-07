// API 模块统一导出
export { default as apiClient } from './auth'
export { authApi } from './auth'
export { marketingTasksApi } from './marketing-tasks'
export { dashboardApi } from './dashboard'
export { analyticsApi } from './analytics'
export { aiApi } from './ai'

// 类型导出
export type {
  MarketingTask,
  TaskStageOutput,
  AdCreative,
  CreateMarketingTaskData,
  UpdateMarketingTaskData,
  CreateCreativeData,
  QueryMarketingTasksParams,
  PaginatedResponse,
} from './marketing-tasks'

export type {
  DashboardMetrics,
  TrendData,
  RecentTask,
} from './dashboard'

export type {
  AnalyticsMetrics,
  ChannelComparison,
  Recommendations,
} from './analytics'
