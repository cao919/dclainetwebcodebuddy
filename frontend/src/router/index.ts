import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { authGuard } from '../auth/authGuard'

// 布局组件
const MainLayout = () => import('@/layouts/MainLayout.vue')
const AuthLayout = () => import('@/layouts/AuthLayout.vue')

// 页面组件
const LoginView = () => import('@/views/auth/LoginView.vue')
const CallbackView = () => import('@/views/auth/CallbackView.vue')
const DashboardView = () => import('@/views/dashboard/DashboardView.vue')
const TasksView = () => import('@/views/tasks/TasksView.vue')
const TaskDetailView = () => import('@/views/tasks/TaskDetailView.vue')
const CreativesView = () => import('@/views/creatives/CreativesView.vue')
const AnalyticsView = () => import('@/views/analytics/AnalyticsView.vue')
const ProfileView = () => import('@/views/profile/ProfileView.vue')
const NotFoundView = () => import('@/views/error/NotFoundView.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/auth',
    component: AuthLayout,
    meta: { requiresAuth: false },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: LoginView,
        meta: { title: '登录' },
      },
      {
        path: 'callback',
        name: 'Callback',
        component: CallbackView,
        meta: { title: '登录回调' },
      },
    ],
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { title: '仪表盘', icon: 'dashboard' },
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: TasksView,
        meta: { title: '营销任务', icon: 'task' },
      },
      {
        path: 'tasks/:id',
        name: 'TaskDetail',
        component: TaskDetailView,
        meta: { title: '任务详情', hidden: true },
      },
      {
        path: 'creatives',
        name: 'Creatives',
        component: CreativesView,
        meta: { title: '创意工坊', icon: 'creative' },
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: AnalyticsView,
        meta: { title: '效果分析', icon: 'analytics' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: ProfileView,
        meta: { title: '个人中心', icon: 'user' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: { title: '页面未找到' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 路由守卫
router.beforeEach(authGuard)

// 路由后置钩子 - 更新页面标题
router.afterEach((to) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - 营销AI智能体系统`
  }
})

export default router