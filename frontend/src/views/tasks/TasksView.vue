<template>
  <div class="tasks-view">
    <div class="page-header">
      <h1>营销任务管理</h1>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>新建任务
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-form :model="queryForm" inline>
        <el-form-item label="任务状态">
          <el-select v-model="queryForm.status" placeholder="全部状态" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="进行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已暂停" value="paused" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="搜索任务名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 任务列表 -->
    <el-card v-loading="loading">
      <el-table :data="taskList" style="width: 100%">
        <el-table-column prop="name" label="任务名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewDetail(row)">{{ row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="budget" label="预算" width="120">
          <template #default="{ row }">
            {{ row.budget ? `¥${row.budget}` : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="阶段/创意" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row._count?.stages || 0 }} 阶段</el-tag>
            <el-tag size="small" type="success" style="margin-left: 4px">{{ row._count?.creatives || 0 }} 创意</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">详情</el-button>
            <el-button link type="warning" @click="handleViewCreatives(row)">创意工坊</el-button>
            <el-button link type="success" @click="handleViewAnalytics(row)">分析</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm
              title="确定删除该任务吗？"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryForm.page"
          v-model:page-size="queryForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 创建任务对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新建营销任务"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
        <el-form-item label="预算" prop="budget">
          <el-input-number v-model="createForm.budget" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="createForm.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="createForm.endDate"
            type="date"
            placeholder="选择结束日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="目标受众" prop="targetAudience">
          <el-input
            v-model="targetAudienceText"
            type="textarea"
            rows="3"
            placeholder="请输入目标受众描述（JSON格式或文本）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑任务对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑任务"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
        <el-form-item label="预算" prop="budget">
          <el-input-number v-model="editForm.budget" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="editForm.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="editForm.endDate"
            type="date"
            placeholder="选择结束日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="任务状态" prop="status">
          <el-select v-model="editForm.status" placeholder="选择状态" style="width: 100%">
            <el-option label="草稿" value="draft" />
            <el-option label="进行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已暂停" value="paused" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="updating" @click="handleUpdate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { marketingTasksApi } from '@/api'
import type { MarketingTask, CreateMarketingTaskData, UpdateMarketingTaskData } from '@/api'

const router = useRouter()
const loading = ref(false)
const taskList = ref<MarketingTask[]>([])
const total = ref(0)

// 查询表单
const queryForm = reactive({
  status: '',
  keyword: '',
  page: 1,
  pageSize: 10,
})

// 创建任务
const showCreateDialog = ref(false)
const creating = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive<CreateMarketingTaskData>({
  name: '',
  description: '',
  budget: undefined,
  startDate: '',
  endDate: '',
  targetAudience: undefined,
})

const targetAudienceText = ref('')

const createRules: FormRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
}

// 编辑任务
const showEditDialog = ref(false)
const updating = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive<UpdateMarketingTaskData & { id?: string }>({
  id: '',
  name: '',
  description: '',
  budget: undefined,
  startDate: '',
  endDate: '',
  status: 'draft',
})

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    draft: 'info',
    active: 'warning',
    completed: 'success',
    paused: 'danger',
  }
  return map[status] || 'info'
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    active: '进行中',
    completed: '已完成',
    paused: '已暂停',
  }
  return map[status] || status
}

// 格式化日期时间
const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 加载任务列表
const loadTasks = async () => {
  loading.value = true
  try {
    const res = await marketingTasksApi.getTasks({
      status: queryForm.status || undefined,
      keyword: queryForm.keyword || undefined,
      page: queryForm.page,
      pageSize: queryForm.pageSize,
    })
    taskList.value = res.data
    total.value = res.meta.total
  } catch (error) {
    ElMessage.error('加载任务列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryForm.page = 1
  loadTasks()
}

// 重置
const handleReset = () => {
  queryForm.status = ''
  queryForm.keyword = ''
  queryForm.page = 1
  loadTasks()
}

// 分页
const handleSizeChange = (val: number) => {
  queryForm.pageSize = val
  queryForm.page = 1
  loadTasks()
}

const handlePageChange = (val: number) => {
  queryForm.page = val
  loadTasks()
}

// 查看详情
const handleViewDetail = (row: MarketingTask) => {
  router.push(`/tasks/${row.id}`)
}

// 查看创意工坊
const handleViewCreatives = (row: MarketingTask) => {
  router.push(`/creatives/${row.id}`)
}

// 查看分析
const handleViewAnalytics = (row: MarketingTask) => {
  router.push(`/analytics/${row.id}`)
}

// 编辑
const handleEdit = (row: MarketingTask) => {
  editForm.id = row.id
  editForm.name = row.name
  editForm.description = row.description
  editForm.budget = row.budget
  editForm.startDate = row.startDate?.split('T')[0] || ''
  editForm.endDate = row.endDate?.split('T')[0] || ''
  editForm.status = row.status
  showEditDialog.value = true
}

// 创建任务
const handleCreate = async () => {
  if (!createFormRef.value) return
  
  await createFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    creating.value = true
    try {
      // 解析目标受众
      if (targetAudienceText.value) {
        try {
          createForm.targetAudience = JSON.parse(targetAudienceText.value)
        } catch {
          createForm.targetAudience = { description: targetAudienceText.value }
        }
      }
      
      await marketingTasksApi.createTask(createForm)
      ElMessage.success('任务创建成功')
      showCreateDialog.value = false
      loadTasks()
      
      // 重置表单
      createForm.name = ''
      createForm.description = ''
      createForm.budget = undefined
      createForm.startDate = ''
      createForm.endDate = ''
      createForm.targetAudience = undefined
      targetAudienceText.value = ''
    } catch (error) {
      ElMessage.error('创建任务失败')
      console.error(error)
    } finally {
      creating.value = false
    }
  })
}

// 更新任务
const handleUpdate = async () => {
  if (!editFormRef.value || !editForm.id) return
  
  await editFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    updating.value = true
    try {
      const { id, ...data } = editForm
      await marketingTasksApi.updateTask(id, data)
      ElMessage.success('任务更新成功')
      showEditDialog.value = false
      loadTasks()
    } catch (error) {
      ElMessage.error('更新任务失败')
      console.error(error)
    } finally {
      updating.value = false
    }
  })
}

// 删除任务
const handleDelete = async (row: MarketingTask) => {
  try {
    await marketingTasksApi.deleteTask(row.id)
    ElMessage.success('任务删除成功')
    loadTasks()
  } catch (error) {
    ElMessage.error('删除任务失败')
    console.error(error)
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped lang="scss">
@use '@/styles/digital-command-center.scss' as dcc;

.tasks-view {
  @include dcc.page-container;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--dcc-spacing-lg);

  h1 {
    @include dcc.page-title;
  }
}

.filter-card {
  @include dcc.glass-card;
  margin-bottom: var(--dcc-spacing-lg);
  
  :deep(.el-form-item__label) {
    color: var(--dcc-text-secondary);
  }
  
  :deep(.el-input__wrapper) {
    background: var(--dcc-bg-input);
    border-color: var(--dcc-border-color);
    box-shadow: none;
  }
  
  :deep(.el-input__inner) {
    color: var(--dcc-text-primary);
  }
  
  :deep(.el-select .el-input__wrapper) {
    background: var(--dcc-bg-input);
    border-color: var(--dcc-border-color);
    box-shadow: none;
  }
}

:deep(.el-card) {
  @include dcc.glass-card;
  
  .el-card__body {
    padding: var(--dcc-spacing-lg);
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--dcc-spacing-lg);
  
  :deep(.el-pagination) {
    --el-pagination-bg-color: transparent;
    --el-pagination-button-bg-color: var(--dcc-bg-card);
    --el-pagination-hover-color: var(--dcc-accent-cyan);
    --el-pagination-text-color: var(--dcc-text-secondary);
    
    .el-pagination__total,
    .el-pagination__jump {
      color: var(--dcc-text-secondary);
    }
    
    .el-pager li {
      background: var(--dcc-bg-card);
      border: 1px solid var(--dcc-border-color);
      color: var(--dcc-text-secondary);
      
      &.is-active {
        background: var(--dcc-gradient-primary);
        border-color: transparent;
        color: var(--dcc-text-primary);
      }
      
      &:hover {
        color: var(--dcc-accent-cyan);
      }
    }
  }
}

// 对话框样式
:deep(.el-dialog) {
  background: var(--dcc-bg-secondary);
  border: 1px solid var(--dcc-border-color);
  border-radius: var(--dcc-radius-lg);
  
  .el-dialog__header {
    border-bottom: 1px solid var(--dcc-border-color);
    padding: var(--dcc-spacing-lg);
    margin-right: 0;
    
    .el-dialog__title {
      color: var(--dcc-text-primary);
      font-weight: 600;
    }
  }
  
  .el-dialog__body {
    padding: var(--dcc-spacing-lg);
  }
  
  .el-form-item__label {
    color: var(--dcc-text-secondary);
  }
  
  .el-input__wrapper {
    background: var(--dcc-bg-input);
    border-color: var(--dcc-border-color);
    box-shadow: none;
  }
  
  .el-input__inner,
  .el-textarea__inner {
    color: var(--dcc-text-primary);
    background: transparent;
  }
}
</style>
