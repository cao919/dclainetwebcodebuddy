import type { RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export async function authGuard(to: RouteLocationNormalized, from: RouteLocationNormalized, next: Function) {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  // 检查认证状态
  await authStore.checkAuth()
  
  if (requiresAuth && !authStore.isAuthenticated) {
    // 需要认证但未登录，重定向到登录页
    next({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  } else if (!requiresAuth && authStore.isAuthenticated && to.path === '/auth/login') {
    // 已登录但访问登录页，重定向到首页
    next({ path: '/' })
  } else {
    // 检查用户权限
    if (requiresAuth && to.meta.roles) {
      const userRole = authStore.user?.role
      const requiredRoles = to.meta.roles as string[]
      
      if (userRole && requiredRoles.includes(userRole)) {
        next()
      } else {
        // 权限不足
        next({ path: '/403' })
      }
    } else {
      next()
    }
  }
}