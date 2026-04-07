<template>
  <div class="not-found-view">
    <el-result
      icon="warning"
      title="404"
      sub-title="页面不存在"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">
          返回首页
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/digital-command-center.scss' as dcc;

.not-found-view {
  @include dcc.page-container;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  
  :deep(.el-result__title) {
    font-size: 72px;
    font-weight: 700;
    background: var(--dcc-gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: var(--dcc-spacing-md);
  }
  
  :deep(.el-result__subtitle) {
    font-size: var(--dcc-font-size-xl);
    color: var(--dcc-text-secondary);
  }
  
  :deep(.el-result__icon) {
    color: var(--dcc-accent-orange);
    font-size: 80px;
  }
  
  :deep(.el-button--primary) {
    @include dcc.gradient-button;
    padding: 12px 32px;
    font-size: var(--dcc-font-size-md);
  }
}
</style>
