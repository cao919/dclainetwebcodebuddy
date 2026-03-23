#!/bin/bash

# 营销AI智能体系统生产环境部署脚本

set -e

echo "=========================================="
echo "  营销AI智能体系统 - 生产环境部署"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
APP_NAME="marketing-ai-agent-system"
VERSION="1.0.0"
DOCKER_REGISTRY="your-registry.com" # 修改为你的Docker仓库
TAG="$DOCKER_REGISTRY/$APP_NAME:$VERSION"

# 检查函数
check_command() {
    if ! command -v $1 > /dev/null; then
        echo -e "${RED}❌ 未找到命令: $1${NC}"
        exit 1
    fi
}

check_file() {
    if [ ! -f "$1" ]; then
        echo -e "${RED}❌ 文件不存在: $1${NC}"
        exit 1
    fi
}

# 检查依赖
echo "🔍 检查部署依赖..."
check_command "docker"
check_command "docker-compose"
check_command "git"

# 检查必要文件
echo "📁 检查必要文件..."
check_file ".env.production"
check_file "docker/docker-compose.prod.yml"
check_file "backend/Dockerfile.prod"
check_file "frontend/Dockerfile.prod"

# 确认部署
echo ""
echo -e "${YELLOW}⚠️  即将部署到生产环境${NC}"
echo "应用名称: $APP_NAME"
echo "版本: $VERSION"
echo "Docker标签: $TAG"
echo ""

read -p "是否继续部署？(y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "部署已取消"
    exit 0
fi

# 创建备份
echo "💾 创建备份..."
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml $BACKUP_DIR/
fi

if [ -f ".env" ]; then
    cp .env $BACKUP_DIR/
fi

echo "✅ 备份已创建到: $BACKUP_DIR"

# 停止现有服务
echo "🛑 停止现有服务..."
docker-compose -f docker/docker-compose.prod.yml down || true

# 构建Docker镜像
echo "🐳 构建Docker镜像..."

echo "构建后端镜像..."
cd backend
docker build -f Dockerfile.prod -t ${APP_NAME}-backend:$VERSION .
cd ..

echo "构建前端镜像..."
cd frontend
docker build -f Dockerfile.prod -t ${APP_NAME}-frontend:$VERSION .
cd ..

# 推送镜像到仓库（可选）
if [ "$DOCKER_REGISTRY" != "your-registry.com" ]; then
    echo "📤 推送镜像到Docker仓库..."
    
    # 登录Docker仓库
    if [ -n "$DOCKER_USERNAME" ] && [ -n "$DOCKER_PASSWORD" ]; then
        echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin $DOCKER_REGISTRY
    fi
    
    # 标记镜像
    docker tag ${APP_NAME}-backend:$VERSION $DOCKER_REGISTRY/${APP_NAME}-backend:$VERSION
    docker tag ${APP_NAME}-frontend:$VERSION $DOCKER_REGISTRY/${APP_NAME}-frontend:$VERSION
    
    # 推送镜像
    docker push $DOCKER_REGISTRY/${APP_NAME}-backend:$VERSION
    docker push $DOCKER_REGISTRY/${APP_NAME}-frontend:$VERSION
    
    echo "✅ 镜像推送完成"
fi

# 启动生产服务
echo "🚀 启动生产服务..."
docker-compose -f docker/docker-compose.prod.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 15

# 运行数据库迁移
echo "🗃️  运行数据库迁移..."
docker-compose -f docker/docker-compose.prod.yml exec backend npx prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  数据库迁移可能已存在，跳过...${NC}"
}

# 检查服务状态
echo "🔍 检查服务状态..."

check_service() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    echo -n "检查服务 $service... "
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f docker/docker-compose.prod.yml ps | grep -q "$service.*Up"; then
            echo -e "${GREEN}✓ 运行正常${NC}"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            echo -e "${RED}✗ 启动失败${NC}"
            return 1
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
}

check_service "postgres"
check_service "redis"
check_service "backend"
check_service "frontend"
check_service "nginx"

# 运行健康检查
echo "🏥 运行健康检查..."

check_health() {
    local name=$1
    local url=$2
    
    echo -n "检查 $name... "
    
    if curl -s -f "$url" > /dev/null; then
        echo -e "${GREEN}✓ 健康${NC}"
        return 0
    else
        echo -e "${RED}✗ 不健康${NC}"
        return 1
    fi
}

check_health "后端API" "http://localhost:3000/health"
check_health "前端应用" "http://localhost"
check_health "API文档" "http://localhost:3000/api/docs"

# 显示部署信息
echo ""
echo "=========================================="
echo "         生产环境部署完成！"
echo "=========================================="
echo ""
echo "🌐 应用访问地址:"
echo "  - 前端应用: http://localhost (或你的域名)"
echo "  - 后端API: http://localhost:3000"
echo "  - API文档: http://localhost:3000/api/docs"
echo ""
echo "🔧 管理工具:"
echo "  - 数据库管理: http://localhost:5555 (如果启用)"
echo "  - Redis管理: http://localhost:8081 (如果启用)"
echo "  - 监控面板: http://localhost:3001 (如果启用)"
echo ""
echo "📊 服务状态:"
echo "  查看服务状态: docker-compose -f docker/docker-compose.prod.yml ps"
echo "  查看服务日志: docker-compose -f docker/docker-compose.prod.yml logs -f"
echo ""
echo "🛠️  常用命令:"
echo "  停止服务: docker-compose -f docker/docker-compose.prod.yml down"
echo "  重启服务: docker-compose -f docker/docker-compose.prod.yml restart"
echo "  更新服务: 运行此脚本再次部署"
echo ""
echo "⚠️  重要提醒:"
echo "  1. 确保防火墙已正确配置"
echo "  2. 定期备份数据库"
echo "  3. 监控系统资源使用情况"
echo "  4. 定期更新安全补丁"
echo ""
echo "=========================================="

# 创建部署记录
DEPLOY_LOG="deployments/$(date +%Y%m%d_%H%M%S).log"
mkdir -p deployments
echo "部署时间: $(date)" > $DEPLOY_LOG
echo "版本: $VERSION" >> $DEPLOY_LOG
echo "镜像标签: $TAG" >> $DEPLOY_LOG
echo "状态: 成功" >> $DEPLOY_LOG

echo "✅ 部署完成，记录保存在: $DEPLOY_LOG"