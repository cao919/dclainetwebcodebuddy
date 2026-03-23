#!/bin/bash

# 营销AI智能体系统开发环境启动脚本
# 适用于Windows Git Bash、Linux、macOS

set -e

echo "=========================================="
echo "  营销AI智能体系统 - 开发环境启动"
echo "=========================================="

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行。请启动Docker Desktop或Docker服务。"
    exit 1
fi

echo "✅ Docker正在运行"

# 创建必要的目录
echo "📁 创建必要目录..."
mkdir -p logs
mkdir -p uploads
mkdir -p backend/logs
mkdir -p frontend/logs

# 复制环境变量示例文件
if [ ! -f ".env" ]; then
    echo "📝 创建.env文件（从.example复制）"
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件，配置必要的环境变量"
fi

if [ ! -f "backend/.env" ]; then
    echo "📝 创建backend/.env文件"
    cp .env backend/.env
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 创建frontend/.env文件"
    echo "VITE_API_BASE_URL=http://localhost:3000" > frontend/.env
    echo "VITE_AUTH0_DOMAIN=your-domain.auth0.com" >> frontend/.env
    echo "VITE_AUTH0_CLIENT_ID=your-client-id" >> frontend/.env
    echo "VITE_AUTH0_AUDIENCE=your-api-audience" >> frontend/.env
    echo "VITE_AUTH0_REDIRECT_URI=http://localhost:5173/callback" >> frontend/.env
    echo "VITE_AUTH0_LOGOUT_REDIRECT_URI=http://localhost:5173" >> frontend/.env
    echo "⚠️  请编辑 frontend/.env 文件，配置前端环境变量"
fi

# 启动Docker服务
echo "🐳 启动Docker服务..."
docker-compose -f docker/docker-compose.yml up -d postgres redis

# 等待数据库就绪
echo "⏳ 等待数据库就绪..."
sleep 10

# 检查数据库连接
echo "🔍 检查数据库连接..."
if ! docker-compose -f docker/docker-compose.yml exec postgres pg_isready -U marketing_ai_user; then
    echo "❌ 数据库连接失败"
    exit 1
fi

echo "✅ 数据库连接正常"

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "📦 后端依赖已安装，跳过..."
fi

# 运行数据库迁移
echo "🗃️  运行数据库迁移..."
npx prisma migrate dev --name init

# 生成Prisma客户端
echo "⚙️  生成Prisma客户端..."
npx prisma generate

cd ..

# 安装前端依赖
echo "📦 安装前端依赖..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "📦 前端依赖已安装，跳过..."
fi

cd ..

# 启动开发服务
echo "🚀 启动开发服务..."

# 启动后端服务（后台运行）
echo "🔧 启动后端服务..."
cd backend
npm run start:dev &
BACKEND_PID=$!
echo "后端进程ID: $BACKEND_PID"
cd ..

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 5

# 启动前端服务（后台运行）
echo "🎨 启动前端服务..."
cd frontend
npm run dev &
FRONTEND_PID=$!
echo "前端进程ID: $FRONTEND_PID"
cd ..

# 启动Prisma Studio（可选）
echo "💾 启动Prisma Studio..."
cd backend
npx prisma studio &
PRISMA_PID=$!
echo "Prisma Studio进程ID: $PRISMA_PID"
cd ..

echo ""
echo "=========================================="
echo "       开发环境启动完成！"
echo "=========================================="
echo ""
echo "🌐 前端应用: http://localhost:5173"
echo "🔧 后端API: http://localhost:3000"
echo "📚 API文档: http://localhost:3000/api/docs"
echo "💾 数据库管理: http://localhost:5555"
echo "🗄️  Redis管理: http://localhost:8081"
echo ""
echo "📊 健康检查:"
echo "  - 后端: http://localhost:3000/health"
echo "  - 数据库: http://localhost:3000/health/db"
echo "  - Redis: http://localhost:3000/health/redis"
echo ""
echo "🛑 停止服务:"
echo "  运行 scripts/stop-dev.sh"
echo ""
echo "📝 日志文件:"
echo "  - 后端日志: backend/logs/app.log"
echo "  - 前端日志: frontend/logs/app.log"
echo "  - Docker日志: docker-compose logs -f"
echo ""
echo "=========================================="

# 保存进程ID到文件
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid
echo "$PRISMA_PID" > .prisma.pid

# 等待用户输入以退出
read -p "按Enter键停止所有服务..."

# 清理进程
echo "🛑 停止服务..."
kill $BACKEND_PID 2>/dev/null || true
kill $FRONTEND_PID 2>/dev/null || true
kill $PRISMA_PID 2>/dev/null || true

# 停止Docker服务
echo "🐳 停止Docker服务..."
docker-compose -f docker/docker-compose.yml down

# 清理PID文件
rm -f .backend.pid .frontend.pid .prisma.pid

echo "✅ 所有服务已停止"
echo "=========================================="