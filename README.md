# 营销AI智能体系统 (Marketing AI Agent System)

一个基于Vue 3 + Nest.js + 智谱AI的智能营销自动化平台，实现8阶段AI驱动的营销工作流。

## 技术栈

### 前端
- **框架**: Vue 3 + TypeScript + Composition API
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **UI组件库**: Element Plus
- **图表**: ECharts 5
- **认证**: Auth0 SSO

### 后端
- **框架**: Nest.js
- **数据库**: PostgreSQL + Prisma ORM
- **缓存**: Redis
- **任务队列**: Bull (Redis)
- **AI集成**: 智谱AI (Zhipu AI)
- **认证**: JWT + Auth0 OAuth2/OIDC

### 基础设施
- **容器化**: Docker + Docker Compose
- **代理**: Nginx
- **CI/CD**: GitHub Actions (待配置)
- **监控**: Prometheus + Grafana (待配置)

## 项目结构

```
D:\Program Files\CodeBuddy\demo\
├── backend/          # Nest.js后端
├── frontend/         # Vue 3前端
├── docker/           # Docker配置
├── prisma/           # 数据库schema和迁移
├── docs/             # 项目文档
└── scripts/          # 开发和部署脚本
```

## 核心功能

### AI驱动的8阶段营销工作流
1. **数据收集** - 收集市场和客户数据
2. **市场分析** - 分析竞争环境和趋势
3. **策略制定** - 制定营销策略和目标
4. **计划编排** - 创建详细的执行计划
5. **创意生成** - AI生成广告创意和内容
6. **执行部署** - 执行营销活动
7. **效果分析** - 监控和分析效果数据
8. **优化迭代** - 基于反馈进行优化

### 主要模块
- **仪表盘** - 数据可视化和管理概览
- **营销任务管理** - 创建、编辑、监控营销任务
- **AI创意工坊** - AI生成广告创意和内容
- **效果分析** - 深度数据分析和报告
- **用户管理** - SSO集成和权限控制

## 快速开始

### 开发环境
```bash
# 克隆项目
git clone <repository-url>

# 安装依赖
cd backend && npm install
cd ../frontend && npm install

# 启动数据库
docker-compose -f docker/docker-compose.yml up -d postgres redis

# 运行数据库迁移
npx prisma migrate dev

# 启动后端
cd backend && npm run start:dev

# 启动前端
cd frontend && npm run dev
```

### 生产部署
```bash
# 构建和部署
docker-compose -f docker/docker-compose.prod.yml up -d --build
```

## 环境变量配置

### 后端 (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/marketing_ai"
REDIS_URL="redis://localhost:6379"
AUTH0_DOMAIN="your-domain.auth0.com"
AUTH0_AUDIENCE="your-api-audience"
ZHIPU_API_KEY="your-zhipu-api-key"
```

### 前端 (.env)
```env
VITE_AUTH0_DOMAIN="your-domain.auth0.com"
VITE_AUTH0_CLIENT_ID="your-client-id"
VITE_AUTH0_AUDIENCE="your-api-audience"
VITE_API_BASE_URL="http://localhost:3000"
```

## 数据库设计

系统包含4个核心表：
1. `marketing_task` - 营销任务主表
2. `task_stage_output` - 任务阶段输出
3. `ad_creative` - 广告创意
4. `marketing_performance` - 营销效果数据

详细schema见 `prisma/schema.prisma`

## API文档

后端提供12个核心API端点：
- 营销任务管理 (6个端点)
- 仪表盘数据 (3个端点)  
- 效果分析 (3个端点)

详细API文档见 `docs/api.md`

## 团队协作

### 开发团队 (5人)
1. **产品经理/架构师** - 需求分析、系统设计、项目管理
2. **Vue前端工程师** - 前端界面开发、用户交互
3. **Nest.js后端工程师** - API开发、业务逻辑
4. **AI集成工程师** - 智谱AI集成、工作流实现
5. **DevOps工程师** - 部署、监控、基础设施

## 开发计划

### 阶段1 (1-2周): 基础框架搭建
- [x] 项目目录结构创建
- [ ] 数据库Schema设计和迁移
- [ ] 后端基础框架搭建
- [ ] 前端基础框架搭建
- [ ] Docker容器化配置

### 阶段2 (3-4周): 核心功能开发
- [ ] Auth0 SSO集成
- [ ] 营销任务管理模块
- [ ] 仪表盘数据可视化
- [ ] 智谱AI集成

### 阶段3 (5-6周): AI工作流实现
- [ ] 8阶段营销工作流逻辑
- [ ] AI创意生成模块
- [ ] 效果分析模块

### 阶段4 (7-8周): 测试和部署
- [ ] 单元测试和集成测试
- [ ] 性能优化
- [ ] 生产环境部署
- [ ] 文档编写

## 许可证

MIT License