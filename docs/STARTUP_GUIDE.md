# 开发服务器启动指南

## 前置条件

确保已安装以下软件：
- Node.js 18+ (https://nodejs.org/)
- npm 9+ (随 Node.js 安装)
- Git (可选)

## 快速启动

### 1. 安装依赖

```bash
# 进入项目根目录
cd "d:\Program Files\CodeBuddy\dclainetwebcodebuddy"

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 数据库配置

项目已配置腾讯云 MySQL 数据库，无需额外配置。

如果使用本地 Docker MySQL：

```bash
# 启动 MySQL 和 Redis
docker-compose -f docker/docker-compose.yml up -d mysql redis

# 查看服务状态
docker-compose -f docker/docker-compose.yml ps
```

### 3. 数据库迁移

```bash
cd backend

# 生成 Prisma 客户端
npx prisma generate

# 运行迁移（创建数据库表）
npx prisma migrate dev --name init

# 或者推送 schema 到数据库（不创建迁移文件）
npx prisma db push
```

### 4. 启动开发服务器

#### 方法一：使用根目录脚本（推荐）

```bash
# 从项目根目录启动前后端
cd "d:\Program Files\CodeBuddy\dclainetwebcodebuddy"

# 启动开发环境（同时启动前端和后端）
npm run dev
```

#### 方法二：分别启动

```bash
# 终端 1 - 启动后端
cd "d:\Program Files\CodeBuddy\dclainetwebcodebuddy\backend"
npm run start:dev

# 终端 2 - 启动前端
cd "d:\Program Files\CodeBuddy\dclainetwebcodebuddy\frontend"
npm run dev
```

### 5. 访问应用

启动成功后，可以访问以下地址：

- **前端应用**: http://localhost:5173
- **后端 API**: http://localhost:3000
- **API 文档 (Swagger)**: http://localhost:3000/api/docs
- **健康检查**: http://localhost:3000/health
- **Prisma Studio (数据库管理)**: http://localhost:5555

## 常见问题

### 问题 1: npm install 失败

**原因**: 网络问题或 npm 配置问题

**解决方案**:
```bash
# 清除 npm 缓存
npm cache clean --force

# 使用国内镜像
npm config set registry https://registry.npmmirror.com

# 重新安装
npm install
```

### 问题 2: Prisma generate 失败

**原因**: 未安装依赖或数据库连接失败

**解决方案**:
```bash
# 确保已安装依赖
cd backend
npm install

# 测试数据库连接
npx prisma db push

# 生成客户端
npx prisma generate
```

### 问题 3: 数据库连接失败

**原因**: 数据库连接信息错误或网络问题

**解决方案**:
```bash
# 检查 .env 文件中的 DATABASE_URL
# 确保 URL 中的密码特殊字符已正确编码

# 测试连接
npx prisma db pull
```

### 问题 4: 端口被占用

**原因**: 端口 3000 或 5173 已被其他应用占用

**解决方案**:
```bash
# 查找占用端口的进程
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# 结束进程
taskkill /PID <进程ID> /F

# 或者修改 .env 文件中的端口配置
PORT="3001"
```

### 问题 5: CORS 错误

**原因**: 前端和后端域名不匹配

**解决方案**:
确保前端 `.env` 中的 `VITE_API_BASE_URL` 与后端地址一致。

## 开发工具

### Prisma Studio

Prisma Studio 是一个可视化的数据库管理工具：

```bash
cd backend
npx prisma studio
```

访问 http://localhost:5555 查看和编辑数据库。

### API 文档

启动后端后，访问 http://localhost:3000/api/docs 查看 Swagger API 文档。

可以在 Swagger 中直接测试 API 接口。

### 调试后端

```bash
cd backend
npm run start:debug
```

这将在调试模式下启动后端，可以使用 VS Code 调试器进行调试。

### 查看日志

```bash
# 后端日志
cd backend
npm run start:dev

# 前端日志
cd frontend
npm run dev
```

## 生产环境部署

### 使用 Docker Compose

```bash
# 构建并启动所有服务
docker-compose -f docker/docker-compose.prod.yml up -d --build

# 查看日志
docker-compose -f docker/docker-compose.prod.yml logs -f

# 停止服务
docker-compose -f docker/docker-compose.prod.yml down
```

### 单独部署

```bash
# 构建后端
cd backend
npm run build
npm run start:prod

# 构建前端
cd frontend
npm run build
npm run preview
```

## 环境变量说明

### 后端环境变量 (.env)

```env
DATABASE_URL="mysql://sa:Admin1q2w%23E@sh-cynosdbmysql-grp-b2tjwrek.sql.tencentcdb.com:20604/txcloudbase-2gr4y00s7a994ecd"
REDIS_URL="redis://localhost:6379"
AUTH0_DOMAIN="your-domain.auth0.com"
AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret"
AUTH0_AUDIENCE="https://api.marketing-ai.com"
JWT_SECRET="your-jwt-secret"
ZHIPU_API_KEY="your-zhipu-api-key"
PORT="3000"
```

### 前端环境变量 (.env)

```env
VITE_API_BASE_URL="http://localhost:3000"
VITE_AUTH0_DOMAIN="your-domain.auth0.com"
VITE_AUTH0_CLIENT_ID="your-auth0-client-id"
VITE_AUTH0_AUDIENCE="https://api.marketing-ai.com"
VITE_AUTH0_REDIRECT_URI="http://localhost:5173/callback"
VITE_AUTH0_LOGOUT_REDIRECT_URI="http://localhost:5173"
```

## 项目结构说明

```
dclainetwebcodebuddy/
├── backend/                 # Nest.js 后端
│   ├── src/                 # 源代码
│   ├── prisma/              # Prisma schema
│   ├── package.json         # 依赖配置
│   └── .env                 # 环境变量
├── frontend/                # Vue 3 前端
│   ├── src/                 # 源代码
│   ├── package.json         # 依赖配置
│   └── .env                 # 环境变量
├── docker/                  # Docker 配置
│   ├── docker-compose.yml   # 开发环境
│   └── docker-compose.prod.yml  # 生产环境
├── docs/                    # 文档
│   ├── PROJECT_SPEC.md      # 项目规范
│   └── MYSQL_SETUP.md      # MySQL 配置指南
├── package.json             # 根目录配置
└── README.md               # 项目说明
```

## 技术支持

如遇到问题，请查看：
1. 错误日志（控制台输出）
2. 文档 (`docs/` 目录)
3. GitHub Issues（如果项目在 GitHub 上）

## 下一步

启动成功后，建议：

1. 查看 Swagger API 文档了解可用接口
2. 使用 Prisma Studio 查看数据库结构
3. 根据需求修改配置文件
4. 开始开发新功能
