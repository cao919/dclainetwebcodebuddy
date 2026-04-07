import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/auth'
import { authApi } from '../api/auth'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userRole = computed(() => user.value?.role || 'guest')

  // Actions
  async function checkAuth() {
    try {
      isLoading.value = true
      
      // 检查本地存储中的令牌
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')
      
      if (storedToken && storedUser) {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        
        // 简化：只检查token是否存在，不调用API验证
        // 实际验证会在API请求时通过拦截器处理
        return true
      }
      
      return false
    } catch (err) {
      console.error('检查认证状态失败:', err)
      clearAuth()
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function login(email: string, password: string) {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await authApi.login({ email, password })
      
      if (response.data) {
        setAuth(response.data.user, response.data.accessToken)
        return true
      }
      
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || '登录失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithAuth0() {
    try {
      isLoading.value = true
      
      // 使用Auth0进行登录
      // 这里应该调用Auth0的登录流程
      // 简化实现：模拟登录
      
      // 在实际应用中，这里应该重定向到Auth0登录页面
      // 登录成功后，Auth0会重定向回应用，在回调页面处理认证
      
      return true
    } catch (err) {
      error.value = 'Auth0登录失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function handleAuth0Callback(auth0User: any) {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await authApi.auth0Callback({ auth0User })
      
      if (response.data) {
        setAuth(response.data.user, response.data.accessToken)
        return true
      }
      
      return false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Auth0回调处理失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      isLoading.value = true
      
      // 调用后端登出API
      await authApi.logout()
      
      // 清除本地认证信息
      clearAuth()
      
      return true
    } catch (err) {
      console.error('登出失败:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      
      if (!refreshToken) {
        throw new Error('没有刷新令牌')
      }
      
      const response = await authApi.refreshToken({ refreshToken })
      
      if (response.data) {
        token.value = response.data.accessToken
        localStorage.setItem('auth_token', response.data.accessToken)
        return true
      }
      
      return false
    } catch (err) {
      console.error('刷新令牌失败:', err)
      clearAuth()
      throw err
    }
  }

  async function validateToken(tokenToValidate: string) {
    try {
      // 调用后端验证令牌
      const response = await authApi.validateToken(tokenToValidate)
      return response.data?.valid || false
    } catch (err) {
      return false
    }
  }

  function setAuth(userData: User, authToken: string) {
    user.value = userData
    token.value = authToken
    
    // 存储到本地存储
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('auth_user', JSON.stringify(userData))
  }

  function clearAuth() {
    user.value = null
    token.value = null
    
    // 清除本地存储
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('refresh_token')
  }

  function updateUser(userData: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
  }

  return {
    // 状态
    user,
    token,
    isLoading,
    error,
    
    // 计算属性
    isAuthenticated,
    userRole,
    
    // Actions
    checkAuth,
    login,
    loginWithAuth0,
    handleAuth0Callback,
    logout,
    refreshToken,
    updateUser,
    clearAuth,
  }
})