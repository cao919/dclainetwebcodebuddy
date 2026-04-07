# 营销AI智能体系统 - 快速启动指南

## 📋 项目状态

✅ **已完成：**
- Prisma Schema 已切换到 MySQL
- 数据库连接配置完成（腾讯云 MySQL）
- Docker 配置已更新
- 环境变量文件已创建
- 前端演示页面已创建
- 启动脚本已创建

⚠️ **待完成：**
- 安装项目依赖（需要网络连接）
- 创建缺失的后端模块文件
- 运行数据库迁移

## 🚀 启动步骤

### 方法一：使用一键启动脚本（推荐）

**Windows 用户：**
```bash
# 双击运行以下文件
start-dev.bat
```

脚本会自动完成：
1. 检查 Node.js 环境
2. 安装后端依赖
3. 生成 Prisma 客户端
4. 安装前端依赖
5. 启动前后端服务器

### 方法二：手动启动

**1. 安装依赖**
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

**2. 生成 Prisma 客户端**
```bash
cd backend
npx prisma generate
```

**3. 运行数据库迁移**
```bash
cd backend
npx prisma migrate dev --name init
```

**4. 启动开发服务器**
```bash
# 终端 1 - 启动后端
cd backend
npm run start:dev

# 终端 2 - 启动前端
cd frontend
npm run dev
```

### 方法三：使用 Docker

```bash
# 启动所有服务
docker-compose -f docker/docker-compose.yml up -d

# 查看日志
docker-compose -f docker/docker-compose.yml logs -f
```

## 🌐 访问地址

启动成功后，访问以下地址：

- **前端应用**: http://localhost:5173
- **后端 API**: http://localhost:3000
- **API 文档**: http://localhost:3000/api/docs
- **健康检查**: http://localhost:3000/health
- **Prisma Studio**: http://localhost:5555

## 📁 项目文件说明

```
dclainetwebcodebuddy/
├── start-dev.bat          # Windows 一键启动脚本 ⭐
├── QUICK_START.md         # 快速启动指南（本文件）
├── README.md             # 项目说明
├── package.json          # 根目录配置
│
├── backend/              # Nest.js 后端
│   ├── src/             # 源代码
│   ├── prisma/          # Prisma 配置
│   ├── .env             # 环境变量（已配置）
│   └── package.json     # 依赖配置
│
├── frontend/             # Vue 3 前端
│   ├── src/             # 源代码
│   │   ├── WelcomeView.vue  # 欢迎页面
│   │   ├── App.vue         # 主应用组件
│   │   └── main.ts         # 入口文件
│   ├── index.html       # HTML 入口
│   ├── vite.config.ts   # Vite 配置
│   ├── .env             # 环境变量
│   └── package.json     # 依赖配置
│
├── docker/              # Docker 配置
│   ├── docker-compose.yml       # 开发环境
│   └── docker-compose.prod.yml  # 生产环境
│
└── docs/               # 文档目录
    ├── PROJECT_SPEC.md      # 项目规范
    ├── MYSQL_SETUP.md      # MySQL 配置指南
    └── STARTUP_GUIDE.md    # 详细启动指南
```

## 🔧 前置要求

确保已安装：

- **Node.js** 18+ [下载](https://nodejs.org/)
- **npm** 9+（随 Node.js 安装）
- **Docker**（可选）[下载](https://www.docker.com/)

检查安装：
```bash
node --version
npm --version
docker --version  # 可选
```

## ⚙️ 数据库配置

项目已配置腾讯云 MySQL 数据库：

- **数据库**: MySQL 8.0
- **主机**: `sh-cynosdbmysql-grp-b2tjwrek.sql.tencentcdb.com`
- **端口**: `20604`
- **数据库名**: `txcloudbase-2gr4y00s7a994ecd`
- **用户名**: `sa`
- **密码**: `Admin1q2w#E`

连接字符串已在 `.env` 文件中配置，无需修改。

## 🐛 常见问题

### Q1: npm install 失败

**A:** 网络问题，使用国内镜像：
```bash
npm config set registry https://registry.npmmirror.com
npm cache clean --force
npm install
```

### Q2: 端口被占用

**A:** 修改 `.env` 文件中的端口：
```env
PORT="3001"  # 后端端口
# 前端端口在 vite.config.ts 中修改
```

### Q3: 数据库连接失败

**A:** 检查网络和连接信息：
```bash
# 测试连接
npx prisma db push
```

### Q4: 找不到模块

**A:** 确保已安装所有依赖：
```bash
cd backend
npm install

cd ../frontend
npm install
```

## 📚 更多文档

- [项目详细规范](docs/PROJECT_SPEC.md)
- [MySQL 配置指南](docs/MYSQL_SETUP.md)
- [详细启动指南](docs/STARTUP_GUIDE.md)

## 🎯 下一步

启动成功后，建议：

1. **查看前端演示页面** - 了解项目界面
2. **查看 API 文档** - http://localhost:3000/api/docs
3. **使用 Prisma Studio** - http://localhost:5555 管理数据库
4. **阅读项目文档** - 了解完整功能和技术架构

## 💡 提示

- 首次启动需要安装依赖，可能需要几分钟
- 如果遇到网络问题，请使用国内 npm 镜像
- 确保 Node.js 版本 >= 18
- 开发服务器会自动监听文件变化并重新加载

## 📞 技术支持

如遇到问题：

1. 查看控制台错误信息
2. 检查文档目录中的相关指南
3. 确保所有前置条件已满足

---

**祝您使用愉快！** 🎉
