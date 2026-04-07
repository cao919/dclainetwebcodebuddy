import apiClient from './auth'

export interface MarketingTask {
  id: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'completed' | 'paused'
  targetAudience?: any
  budget?: number
  startDate?: string
  endDate?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  _count?: {
    stages: number
    creatives: number
  }
}

export interface TaskStageOutput {
  id: string
  taskId: string
  stage: string
  output: any
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
}

export interface AdCreative {
  id: string
  taskId: string
  type: 'text' | 'image' | 'video' | 'carousel'
  title?: string
  content: any
  status: 'draft' | 'approved' | 'rejected' | 'published'
  aiGenerated: boolean
  aiModel?: string
  createdAt: string
  updatedAt: string
}

export interface CreateMarketingTaskData {
  name: string
  description?: string
  targetAudience?: any
  budget?: number
  startDate?: string
  endDate?: string
}

export interface UpdateMarketingTaskData {
  name?: string
  description?: string
  targetAudience?: any
  budget?: number
  startDate?: string
  endDate?: string
  status?: 'draft' | 'active' | 'completed' | 'paused'
}

export interface CreateCreativeData {
  type: 'headline' | 'description' | 'image' | 'video'
  title?: string
  content: any
  aiGenerated?: boolean
  aiModel?: string
  status?: string
}

export interface QueryMarketingTasksParams {
  status?: string
  keyword?: string
  page?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export const marketingTasksApi = {
  // 获取任务列表
  getTasks: async (params?: QueryMarketingTasksParams): Promise<PaginatedResponse<MarketingTask>> => {
    const response = await apiClient.get('/marketing-tasks', { params })
    return response.data
  },

  // 获取任务详情
  getTask: async (id: string): Promise<MarketingTask & { stages: TaskStageOutput[]; creatives: AdCreative[] }> => {
    const response = await apiClient.get(`/marketing-tasks/${id}`)
    return response.data
  },

  // 创建任务
  createTask: async (data: CreateMarketingTaskData): Promise<MarketingTask> => {
    const response = await apiClient.post('/marketing-tasks', data)
    return response.data
  },

  // 更新任务
  updateTask: async (id: string, data: UpdateMarketingTaskData): Promise<MarketingTask> => {
    const response = await apiClient.patch(`/marketing-tasks/${id}`, data)
    return response.data
  },

  // 删除任务
  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/marketing-tasks/${id}`)
  },

  // 获取任务阶段输出
  getTaskStages: async (id: string): Promise<TaskStageOutput[]> => {
    const response = await apiClient.get(`/marketing-tasks/${id}/stages`)
    return response.data
  },

  // 获取任务创意列表
  getTaskCreatives: async (id: string): Promise<AdCreative[]> => {
    const response = await apiClient.get(`/marketing-tasks/${id}/creatives`)
    return response.data
  },

  // 保存创意
  createCreative: async (taskId: string, data: CreateCreativeData): Promise<AdCreative> => {
    const response = await apiClient.post(`/marketing-tasks/${taskId}/creatives`, data)
    return response.data
  },

  // 推进任务阶段
  advanceStage: async (taskId: string, output?: any): Promise<{ message: string; currentStage: string }> => {
    const response = await apiClient.post(`/marketing-tasks/${taskId}/advance-stage`, { output })
    return response.data
  },

  // 完成特定阶段并推进到下一阶段
  completeStage: async (taskId: string, stageId: string, output?: any): Promise<{ message: string; currentStage: string }> => {
    const response = await apiClient.post(`/marketing-tasks/${taskId}/complete-stage`, { stageId, output })
    return response.data
  },
}
