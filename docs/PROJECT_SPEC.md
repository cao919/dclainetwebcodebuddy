# 营销AI智能体系统 - 项目详细规范

## 1. 项目概述

### 1.1 项目目标
构建一个基于AI的智能营销自动化系统，通过8阶段工作流程实现端到端的营销活动管理、创意生成和效果优化。

### 1.2 核心价值
- **自动化**: 减少人工操作，提高营销效率
- **智能化**: 利用AI进行创意生成和策略优化
- **数据驱动**: 基于实时数据进行决策和调整
- **一体化**: 集成营销全流程，从策划到分析

## 2. 系统架构

### 2.1 技术架构图
```
┌─────────────────────────────────────────────────────────┐
│                    用户界面层 (UI Layer)                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐         │
│  │   仪表盘   │ │ 任务管理   │ │ 创意工坊   │         │
│  └────────────┘ └────────────┘ └────────────┘         │
├─────────────────────────────────────────────────────────┤
│                  API网关层 (API Gateway)                │
│  ┌────────────────────────────────────────────┐        │
│  │           Nest.js RESTful API             │        │
│  └────────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────────┤
│                业务逻辑层 (Business Logic)              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐         │
│  │ 任务服务   │ │ AI服务     │ │ 分析服务   │         │
│  └────────────┘ └────────────┘ └────────────┘         │
├─────────────────────────────────────────────────────────┤
│                 数据访问层 (Data Access)                │
│  ┌────────────┐ ┌────────────┐                       │
│  │  Prisma    │ │  Redis     │                       │
│  └────────────┘ └────────────┘                       │
├─────────────────────────────────────────────────────────┤
│                 基础设施层 (Infrastructure)             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐         │
│  │ PostgreSQL │ │  Docker    │ │  Nginx     │         │
│  └────────────┘ └────────────┘ └────────────┘         │
└─────────────────────────────────────────────────────────┘
```

### 2.2 组件说明

#### 2.2.1 前端组件
- **仪表盘组件**: 数据可视化、KPI展示、实时监控
- **任务管理组件**: 任务创建、编辑、状态跟踪
- **创意工坊组件**: AI创意生成、预览、编辑
- **分析报告组件**: 数据图表、趋势分析、导出功能
- **用户管理组件**: 登录、权限、个人设置

#### 2.2.2 后端服务
- **认证服务**: Auth0集成、JWT验证、权限控制
- **任务服务**: 营销任务CRUD、状态管理、工作流推进
- **AI服务**: 智谱AI集成、创意生成、优化建议
- **分析服务**: 数据聚合、报表生成、趋势预测
- **队列服务**: 异步任务处理、工作流执行

## 3. 数据库设计

### 3.1 实体关系图
```
┌──────────────────┐      ┌─────────────────────┐
│  marketing_task  │      │ task_stage_output   │
├──────────────────┤      ├─────────────────────┤
│ id: string       │◄─────│ task_id: string     │
│ name: string     │      │ stage: string       │
│ description: text│      │ output: json        │
│ status: enum     │      │ created_at: datetime│
│ created_at: datetime│   └─────────────────────┘
│ updated_at: datetime│
│ created_by: string│
└──────────────────┘
        │
        │ 1:*
        ▼
┌──────────────────┐      ┌─────────────────────┐
│   ad_creative    │      │ marketing_performance│
├──────────────────┤      ├─────────────────────┤
│ id: string       │◄─────│ creative_id: string │
│ task_id: string  │      │ metrics: json       │
│ type: enum       │      │ period_start: datetime│
│ content: json    │      │ period_end: datetime │
│ ai_generated: boolean│  │ created_at: datetime│
│ created_at: datetime│  └─────────────────────┘
└──────────────────┘
```

### 3.2 数据字典

#### marketing_task (营销任务表)
| 字段名 | 类型 | 必填 | 说明 | 约束 |
|--------|------|------|------|------|
| id | UUID | 是 | 主键 | PRIMARY KEY |
| name | string(255) | 是 | 任务名称 | NOT NULL |
| description | text | 否 | 任务描述 | |
| status | enum | 是 | 任务状态 | 'draft', 'active', 'paused', 'completed', 'failed' |
| target_audience | json | 否 | 目标受众 | JSON格式 |
| budget | decimal(10,2) | 否 | 预算 | |
| start_date | datetime | 否 | 开始时间 | |
| end_date | datetime | 否 | 结束时间 | |
| created_by | string(100) | 是 | 创建人 | NOT NULL |
| created_at | datetime | 是 | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | datetime | 是 | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

#### task_stage_output (任务阶段输出表)
| 字段名 | 类型 | 必填 | 说明 | 约束 |
|--------|------|------|------|------|
| id | UUID | 是 | 主键 | PRIMARY KEY |
| task_id | UUID | 是 | 任务ID | FOREIGN KEY |
| stage | enum | 是 | 阶段名称 | 'data_collection', 'market_analysis', 'strategy', 'planning', 'creative', 'execution', 'analysis', 'optimization' |
| output | json | 是 | 阶段输出 | NOT NULL |
| status | enum | 是 | 阶段状态 | 'pending', 'processing', 'completed', 'failed' |
| created_at | datetime | 是 | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | datetime | 是 | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

#### ad_creative (广告创意表)
| 字段名 | 类型 | 必填 | 说明 | 约束 |
|--------|------|------|------|------|
| id | UUID | 是 | 主键 | PRIMARY KEY |
| task_id | UUID | 是 | 任务ID | FOREIGN KEY |
| type | enum | 是 | 创意类型 | 'text', 'image', 'video', 'composite' |
| title | string(255) | 否 | 标题 | |
| content | json | 是 | 创意内容 | NOT NULL |
| ai_generated | boolean | 是 | AI生成 | DEFAULT true |
| ai_model | string(100) | 否 | AI模型 | |
| status | enum | 是 | 状态 | 'draft', 'approved', 'rejected', 'published' |
| created_at | datetime | 是 | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | datetime | 是 | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

#### marketing_performance (营销效果表)
| 字段名 | 类型 | 必填 | 说明 | 约束 |
|--------|------|------|------|------|
| id | UUID | 是 | 主键 | PRIMARY KEY |
| creative_id | UUID | 是 | 创意ID | FOREIGN KEY |
| metrics | json | 是 | 效果指标 | NOT NULL |
| period_start | datetime | 是 | 统计开始时间 | |
| period_end | datetime | 是 | 统计结束时间 | |
| source | string(100) | 否 | 数据来源 | |
| created_at | datetime | 是 | 创建时间 | DEFAULT CURRENT_TIMESTAMP |

## 4. API规范

### 4.1 认证API
- `POST /auth/login` - Auth0登录回调
- `POST /auth/logout` - 用户登出
- `GET /auth/profile` - 获取用户信息
- `POST /auth/refresh` - 刷新访问令牌

### 4.2 任务管理API
- `GET /tasks` - 获取任务列表（支持分页、过滤、排序）
- `GET /tasks/:id` - 获取单个任务详情
- `POST /tasks` - 创建新任务
- `PUT /tasks/:id` - 更新任务
- `DELETE /tasks/:id` - 删除任务
- `POST /tasks/:id/start` - 启动任务
- `POST /tasks/:id/pause` - 暂停任务
- `POST /tasks/:id/complete` - 完成任务
- `GET /tasks/:id/stages` - 获取任务阶段状态
- `POST /tasks/:id/stages/:stage/execute` - 执行特定阶段

### 4.3 创意管理API
- `GET /creatives` - 获取创意列表
- `GET /creatives/:id` - 获取创意详情
- `POST /creatives` - 创建新创意
- `PUT /creatives/:id` - 更新创意
- `DELETE /creatives/:id` - 删除创意
- `POST /creatives/generate` - AI生成创意
- `POST /creatives/:id/approve` - 批准创意
- `POST /creatives/:id/publish` - 发布创意

### 4.4 数据分析API
- `GET /analytics/dashboard` - 仪表盘数据
- `GET /analytics/tasks/overview` - 任务概览统计
- `GET /analytics/creatives/performance` - 创意效果分析
- `GET /analytics/trends` - 趋势分析
- `POST /analytics/reports` - 生成分析报告

### 4.5 AI服务API
- `POST /ai/generate/text` - 文本生成
- `POST /ai/generate/image` - 图片生成
- `POST /ai/optimize/suggestion` - 优化建议
- `POST /ai/workflow/execute` - 执行完整工作流

## 5. AI工作流规范

### 5.1 8阶段工作流程

#### 阶段1: 数据收集 (Data Collection)
- **输入**: 任务基本信息、目标受众
- **处理**: 收集市场数据、用户数据、竞争情报
- **输出**: 结构化数据报告
- **AI工具**: 数据聚合、分类

#### 阶段2: 市场分析 (Market Analysis)
- **输入**: 收集的数据
- **处理**: SWOT分析、趋势分析、机会识别
- **输出**: 市场分析报告
- **AI工具**: 智谱GLM-4分析

#### 阶段3: 策略制定 (Strategy)
- **输入**: 市场分析报告
- **处理**: 制定营销策略、定位、目标设定
- **输出**: 营销策略文档
- **AI工具**: 策略建议生成

#### 阶段4: 计划编排 (Planning)
- **输入**: 营销策略
- **处理**: 制定详细执行计划、时间线、资源分配
- **输出**: 执行计划
- **AI工具**: 计划优化

#### 阶段5: 创意生成 (Creative)
- **输入**: 执行计划、目标受众
- **处理**: 生成广告文案、视觉创意、多媒体内容
- **输出**: 创意内容
- **AI工具**: 智谱GLM-4文本生成、CogView图片生成

#### 阶段6: 执行部署 (Execution)
- **输入**: 创意内容、执行计划
- **处理**: 部署到各营销渠道、监控执行
- **输出**: 执行状态报告
- **AI工具**: 自动化部署

#### 阶段7: 效果分析 (Analysis)
- **输入**: 执行数据、效果指标
- **处理**: 数据分析、效果评估、ROI计算
- **输出**: 效果分析报告
- **AI工具**: 数据分析、模式识别

#### 阶段8: 优化迭代 (Optimization)
- **输入**: 效果分析报告
- **处理**: 识别优化点、调整策略、迭代改进
- **输出**: 优化建议
- **AI工具**: 智谱GLM-4优化建议

### 5.2 工作流状态机
```
        ┌───────────┐
        │   draft   │
        └─────┬─────┘
              │ create
        ┌─────▼─────┐
        │   active  │
        └─────┬─────┘
              │
    ┌─────────┼─────────┐
    │         │         │
┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│stage1 │ │stage2 │ │stage3 │
│data   │ │market │ │strategy│
└───┬───┘ └───┬───┘ └───┬───┘
    │         │         │
┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│stage4 │ │stage5 │ │stage6 │
│planning│ │creative││execution│
└───┬───┘ └───┬───┘ └───┬───┘
    │         │         │
┌───▼───┐ ┌───▼───┐     │
│stage7 │ │stage8 │     │
│analysis││optimization││
└───┬───┘ └───┬───┘     │
    │         │         │
    └─────────┼─────────┘
              │
        ┌─────▼─────┐
        │ completed │
        └───────────┘
```

## 6. 前端界面规范

### 6.1 页面布局

#### 6.1.1 主布局 (Main Layout)
```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo + 用户菜单 + 通知 + 搜索                  │
├─────────────────────────────────────────────────────────┤
│  Sidebar: 导航菜单                                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ • 仪表盘                                         │  │
│  │ • 营销任务                                       │  │
│  │ • 创意工坊                                       │  │
│  │ • 效果分析                                       │  │
│  │ • 用户管理                                       │  │
│  └──────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  Content: 页面主要内容区域                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                  │  │
│  │                  页面内容                        │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 6.2 组件设计规范

#### 6.2.1 颜色方案
- **主色**: #409EFF (Element Plus Blue)
- **辅助色**: #67C23A (Success), #E6A23C (Warning), #F56C6C (Danger)
- **中性色**: #303133 (Text), #606266 (Secondary), #909399 (Placeholder)
- **背景色**: #F5F7FA (Background)

#### 6.2.2 字体规范
- **主字体**: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI'
- **字体大小**: 14px (Base), 12px (Small), 16px (Large), 20px (Title)
- **行高**: 1.5 (Normal), 1.3 (Dense), 1.7 (Loose)

#### 6.2.3 间距规范
- **基础间距**: 8px
- **组件间距**: 16px
- **区块间距**: 24px
- **页面间距**: 32px

## 7. 部署架构

### 7.1 开发环境
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Vue Dev   │    │  Nest Dev   │    │   Prisma    │
│   Server    │◄──►│   Server    │◄──►│   Studio    │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                   ▲                   ▲
       │                   │                   │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Docker    │    │   Docker    │    │   Docker    │
│  PostgreSQL │    │    Redis    │    │    Nginx    │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 7.2 生产环境
```
┌─────────────────────────────────────────────────────┐
│                  Load Balancer                      │
└─────────────────────────────────────────────────────┘
        │                     │                     │
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Nginx     │      │   Nginx     │      │   Nginx     │
│   (Frontend)│      │   (Backend) │      │   (Static)  │
└─────────────┘      └─────────────┘      └─────────────┘
        │                     │                     │
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Vue App   │      │  Nest App   │      │   Redis     │
│   (Container)│     │  (Container)│     │  (Cluster)  │
└─────────────┘      └─────────────┘      └─────────────┘
                                │                     │
                        ┌─────────────┐      ┌─────────────┐
                        │ PostgreSQL  │      │  Monitoring │
                        │  (Primary)  │      │   (Prometheus)│
                        └─────────────┘      └─────────────┘
                                │                     │
                        ┌─────────────┐      ┌─────────────┐
                        │ PostgreSQL  │      │   Grafana   │
                        │  (Replica)  │      │             │
                        └─────────────┘      └─────────────┘
```

## 8. 安全规范

### 8.1 认证和授权
- **SSO**: 使用Auth0实现单点登录
- **OAuth 2.0**: 标准授权流程
- **JWT**: JSON Web Token进行API认证
- **RBAC**: 基于角色的访问控制

### 8.2 数据安全
- **加密**: 敏感数据加密存储
- **传输安全**: HTTPS强制使用
- **输入验证**: 所有用户输入验证和清理
- **SQL注入防护**: 使用Prisma参数化查询

### 8.3 API安全
- **速率限制**: API请求频率限制
- **CORS**: 跨域资源共享配置
- **API密钥**: 智谱AI API密钥安全存储
- **审计日志**: 所有API调用记录

## 9. 监控和运维

### 9.1 健康检查
- `GET /health` - 应用健康状态
- `GET /health/db` - 数据库连接状态
- `GET /health/redis` - Redis连接状态

### 9.2 性能监控
- **应用指标**: 请求数、响应时间、错误率
- **系统指标**: CPU、内存、磁盘、网络
- **业务指标**: 任务完成率、创意生成数、用户活跃度

### 9.3 日志规范
- **访问日志**: 所有API请求记录
- **应用日志**: 应用运行日志（INFO、WARN、ERROR）
- **审计日志**: 用户操作和安全事件
- **结构化日志**: JSON格式便于分析

## 10. 测试策略

### 10.1 测试类型
- **单元测试**: 组件、服务、工具函数
- **集成测试**: API端点、数据库操作
- **E2E测试**: 完整用户流程
- **性能测试**: 负载测试、压力测试

### 10.2 测试覆盖率目标
- **后端**: >80% 代码覆盖率
- **前端**: >70% 代码覆盖率
- **关键路径**: 100% 测试覆盖

## 11. 开发流程

### 11.1 Git工作流
- **分支策略**: Git Flow
- **提交规范**: Conventional Commits
- **代码审查**: Pull Request + Review
- **CI/CD**: 自动化测试和部署

### 11.2 开发环境设置
1. 安装Node.js 18+和npm
2. 安装Docker和Docker Compose
3. 克隆项目仓库
4. 安装依赖: `npm install`
5. 配置环境变量
6. 启动数据库: `npm run docker:up`
7. 运行迁移: `npm run prisma:migrate`
8. 启动开发服务器: `npm run dev`

## 12. 项目里程碑

### 阶段1: 基础框架 (2周)
- [ ] 项目初始化
- [ ] 数据库设计
- [ ] 基础架构搭建
- [ ] 认证系统集成

### 阶段2: 核心功能 (3周)
- [ ] 任务管理模块
- [ ] 创意生成模块
- [ ] 基础数据分析

### 阶段3: AI集成 (2周)
- [ ] 智谱AI集成
- [ ] 工作流引擎
- [ ] 优化算法

### 阶段4: 完善和优化 (1周)
- [ ] 性能优化
- [ ] 用户体验改进
- [ ] 文档编写
- [ ] 部署上线