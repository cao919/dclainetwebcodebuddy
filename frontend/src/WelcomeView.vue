<template>
  <div class="welcome-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>🤖 营销AI智能体系统</h1>
          <p>Marketing AI Agent System</p>
        </div>
      </el-header>

      <el-main>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-card class="welcome-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon :size="24"><Promotion /></el-icon>
                  <span>欢迎使用营销AI智能体系统</span>
                </div>
              </template>

              <div class="welcome-content">
                <p>这是一个基于 AI 的智能营销自动化平台，通过 8 阶段工作流程实现端到端的营销活动管理。</p>

                <el-divider />

                <h3>核心功能</h3>
                <el-row :gutter="20">
                  <el-col :xs="24" :sm="12" :md="6">
                    <div class="feature-item">
                      <el-icon :size="40" color="#409EFF"><DataBoard /></el-icon>
                      <h4>数据收集</h4>
                      <p>收集市场和客户数据</p>
                    </div>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="6">
                    <div class="feature-item">
                      <el-icon :size="40" color="#67C23A"><TrendCharts /></el-icon>
                      <h4>市场分析</h4>
                      <p>分析竞争环境和趋势</p>
                    </div>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="6">
                    <div class="feature-item">
                      <el-icon :size="40" color="#E6A23C"><EditPen /></el-icon>
                      <h4>创意生成</h4>
                      <p>AI 生成广告创意和内容</p>
                    </div>
                  </el-col>
                  <el-col :xs="24" :sm="12" :md="6">
                    <div class="feature-item">
                      <el-icon :size="40" color="#F56C6C"><DataAnalysis /></el-icon>
                      <h4>效果分析</h4>
                      <p>监控和分析效果数据</p>
                    </div>
                  </el-col>
                </el-row>

                <el-divider />

                <h3>技术栈</h3>
                <el-tag class="tech-tag">Vue 3</el-tag>
                <el-tag class="tech-tag" type="success">TypeScript</el-tag>
                <el-tag class="tech-tag" type="warning">Element Plus</el-tag>
                <el-tag class="tech-tag" type="danger">Nest.js</el-tag>
                <el-tag class="tech-tag" type="info">MySQL</el-tag>
                <el-tag class="tech-tag" type="primary">智谱AI</el-tag>

                <el-divider />

                <el-result
                  icon="success"
                  title="开发服务器启动成功"
                  sub-title="项目已成功连接到腾讯云 MySQL 数据库"
                >
                  <template #extra>
                    <el-button type="primary" size="large" @click="openBackend">
                      查看 API 文档
                    </el-button>
                    <el-button size="large" @click="openPrisma">
                      数据库管理
                    </el-button>
                  </template>
                </el-result>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>

      <el-footer>
        <p>&copy; 2024 营销AI智能体系统 | Marketing AI Agent System</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import {
  Promotion,
  DataBoard,
  TrendCharts,
  EditPen,
  DataAnalysis
} from '@element-plus/icons-vue'

const openBackend = () => {
  window.open('http://localhost:3000/api/docs', '_blank')
}

const openPrisma = () => {
  window.open('http://localhost:5555', '_blank')
}
</script>

<style scoped>
.welcome-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.el-header {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-content {
  text-align: center;
}

.header-content h1 {
  margin: 0;
  font-size: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-content p {
  margin: 5px 0 0;
  color: #606266;
  font-size: 14px;
}

.el-main {
  padding: 40px 20px;
}

.welcome-card {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.98);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

.welcome-content {
  text-align: center;
}

.welcome-content > p {
  font-size: 16px;
  color: #606266;
  line-height: 1.8;
}

.feature-item {
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
  border-radius: 8px;
  cursor: pointer;
}

.feature-item:hover {
  background: #f5f7fa;
  transform: translateY(-5px);
}

.feature-item h4 {
  margin: 15px 0 10px;
  font-size: 16px;
  color: #303133;
}

.feature-item p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.tech-tag {
  margin: 0 8px 8px;
  font-size: 14px;
}

.el-footer {
  background: rgba(255, 255, 255, 0.95);
  text-align: center;
  padding: 20px;
  color: #909399;
}

.el-result {
  padding: 40px 0 20px;
}
</style>
