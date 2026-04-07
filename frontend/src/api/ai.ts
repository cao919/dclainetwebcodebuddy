import apiClient from './auth'

export const aiApi = {
  // 生成文案
  generateText: async (data: {
    prompt: string
    type: string
    model?: string
  }) => {
    const response = await apiClient.post('/ai/generate/text', {
      prompt: data.prompt,
      options: {
        type: data.type,
        model: data.model,
      },
    })
    return response.data
  },

  // 生成图片
  generateImage: async (data: {
    prompt: string
    style?: string
    ratio?: string
    model?: string
  }) => {
    const response = await apiClient.post('/ai/generate/image', {
      prompt: data.prompt,
      options: {
        style: data.style,
        ratio: data.ratio,
        model: data.model,
      },
    })
    return response.data
  },

  // 执行工作流
  executeWorkflow: async (data: {
    taskId: string
    stage: string
    input: any
  }) => {
    const response = await apiClient.post('/ai/execute-workflow', data)
    return response.data
  },
}
