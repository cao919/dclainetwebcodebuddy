#!/bin/bash

# 营销AI智能体系统环境检查脚本

set -e

echo "=========================================="
echo "  营销AI智能体系统 - 环境检查"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查结果
PASS=0
WARN=0
FAIL=0

check_item() {
    local name=$1
    local check_cmd=$2
    local fix_hint=$3
    
    echo -n "检查 $name... "
    
    if eval "$check_cmd" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 通过${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗ 失败${NC}"
        if [ -n "$fix_hint" ]; then
            echo -e "  ${YELLOW}提示: $fix_hint${NC}"
        fi
        ((FAIL++))
        return 1
    fi
}

check_warning() {
    local name=$1
    local check_cmd=$2
    local warning_msg=$3
    
    echo -n "检查 $name... "
    
    if eval "$check_cmd" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 通过${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${YELLOW}⚠️  警告${NC}"
        if [ -n "$warning_msg" ]; then
            echo -e "  ${YELLOW}注意: $warning_msg${NC}"
        fi
        ((WARN++))
        return 1
    fi
}

echo ""
echo "🔍 系统依赖检查..."

# 检查Docker
check_item "Docker" "docker --version" "请安装Docker: https://docs.docker.com/get-docker/"
check_item "Docker Compose" "docker-compose --version" "请安装Docker Compose: https://docs.docker.com/compose/install/"

# 检查Docker服务状态
check_item "Docker服务运行" "docker info" "请启动Docker服务"

# 检查Node.js
check_warning "Node.js (>=18.0.0)" "node --version | grep -q 'v18\|v19\|v20'" "推荐使用Node.js 18或更高版本"
check_warning "npm (>=9.0.0)" "npm --version | grep -q '^9\|^10'" "推荐使用npm 9或更高版本"

echo ""
echo "📁 项目文件检查..."

# 检查必要文件
check_item "项目根目录" "[ -d . ]" "请在项目根目录运行此脚本"
check_item "后端目录" "[ -d backend ]" "后端目录不存在"
check_item "前端目录" "[ -d frontend ]" "前端目录不存在"
check_item "Docker配置目录" "[ -d docker ]" "Docker配置目录不存在"

# 检查配置文件
check_warning "环境变量文件(.env)" "[ -f .env ]" "请创建.env文件: cp .env.example .env"
check_warning "后端环境变量" "[ -f backend/.env ]" "请创建backend/.env文件"
check_warning "前端环境变量" "[ -f frontend/.env ]" "请创建frontend/.env文件"

check_item "Docker Compose文件" "[ -f docker/docker-compose.yml ]" "Docker Compose配置文件不存在"
check_item "生产环境Compose文件" "[ -f docker/docker-compose.prod.yml ]" "生产环境Compose文件不存在"

echo ""
echo "🔧 配置文件检查..."

# 检查环境变量配置
if [ -f .env ]; then
    echo "检查.env文件配置..."
    
    # 检查关键变量
    required_vars=(
        "DATABASE_URL"
        "AUTH0_DOMAIN"
        "AUTH0_CLIENT_ID"
        "AUTH0_CLIENT_SECRET"
        "AUTH0_AUDIENCE"
        "ZHIPU_API_KEY"
        "JWT_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env; then
            value=$(grep "^$var=" .env | cut -d'=' -f2-)
            if [[ "$value" == *"your-"* ]] || [[ "$value" == *"example"* ]] || [ -z "$value" ]; then
                echo -e "  ${YELLOW}⚠️  $var 需要配置实际值${NC}"
                ((WARN++))
            else
                echo -e "  ${GREEN}✓ $var 已配置${NC}"
                ((PASS++))
            fi
        else
            echo -e "  ${RED}✗ $var 未配置${NC}"
            ((FAIL++))
        fi
    done
fi

echo ""
echo "🐳 Docker镜像检查..."

# 检查必要的基础镜像
echo "检查Docker基础镜像..."
required_images=(
    "postgres:15-alpine"
    "redis:7-alpine"
    "node:18-alpine"
    "nginx:alpine"
)

for image in "${required_images[@]}"; do
    if docker image ls | grep -q "$image"; then
        echo -e "  ${GREEN}✓ $image 已存在${NC}"
        ((PASS++))
    else
        echo -e "  ${YELLOW}⚠️  $image 不存在（启动时会自动拉取）${NC}"
        ((WARN++))
    fi
done

echo ""
echo "📊 端口占用检查..."

# 检查端口占用
check_port() {
    local port=$1
    local service=$2
    
    echo -n "检查端口 $port ($service)... "
    
    if command -v netstat > /dev/null; then
        if netstat -tuln | grep -q ":$port "; then
            echo -e "${YELLOW}⚠️  已被占用${NC}"
            ((WARN++))
            return 1
        else
            echo -e "${GREEN}✓ 可用${NC}"
            ((PASS++))
            return 0
        fi
    elif command -v ss > /dev/null; then
        if ss -tuln | grep -q ":$port "; then
            echo -e "${YELLOW}⚠️  已被占用${NC}"
            ((WARN++))
            return 1
        else
            echo -e "${GREEN}✓ 可用${NC}"
            ((PASS++))
            return 0
        fi
    else
        echo -e "${YELLOW}⚠️  无法检查（需要netstat或ss）${NC}"
        ((WARN++))
        return 1
    fi
}

check_port "5432" "PostgreSQL"
check_port "6379" "Redis"
check_port "3000" "后端API"
check_port "5173" "前端开发服务器"
check_port "80" "HTTP"
check_port "443" "HTTPS"
check_port "5555" "Prisma Studio"
check_port "8081" "Redis Commander"

echo ""
echo "=========================================="
echo "           环境检查结果"
echo "=========================================="
echo -e "${GREEN}通过: $PASS${NC}"
echo -e "${YELLOW}警告: $WARN${NC}"
echo -e "${RED}失败: $FAIL${NC}"
echo ""

if [ $FAIL -gt 0 ]; then
    echo -e "${RED}❌ 环境检查未通过，请修复失败项后再试。${NC}"
    echo ""
    echo "修复建议:"
    echo "1. 安装缺失的依赖项"
    echo "2. 创建必要的配置文件"
    echo "3. 配置正确的环境变量"
    echo "4. 释放被占用的端口"
    exit 1
elif [ $WARN -gt 0 ]; then
    echo -e "${YELLOW}⚠️  环境检查有警告项，建议修复但可以继续。${NC}"
    echo ""
    echo "警告项可能需要关注，但不会阻止系统运行。"
    read -p "是否继续？(y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "操作已取消"
        exit 0
    fi
else
    echo -e "${GREEN}✅ 环境检查全部通过！系统可以正常部署和运行。${NC}"
fi

echo ""
echo "下一步建议:"
echo "1. 运行 scripts/start-dev.sh 启动开发环境"
echo "2. 运行 scripts/test-system.sh 测试系统功能"
echo "3. 运行 scripts/deploy-prod.sh 部署到生产环境"
echo ""
echo "=========================================="