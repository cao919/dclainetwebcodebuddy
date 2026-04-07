import type { RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export async function authGuard(to: RouteLocationNormalized, from: RouteLocationNormalized, next: Function) {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  // 检查认证状态
  const isAuthenticated = await authStore.checkAuth()
  
  if (requiresAuth && !isAuthenticated) {
    // 需要认证但未登录，重定向到登录页，默认跳转到仪表盘
    next({
      path: '/auth/login',
      query: { redirect: '/dashboard' },
    })
  } else if (!requiresAuth && isAuthenticated && to.path === '/auth/login') {
    // 已登录但访问登录页，重定向到仪表盘
    next({ path: '/dashboard' })
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
