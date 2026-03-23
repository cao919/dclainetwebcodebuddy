#!/bin/bash

# 营销AI智能体系统测试脚本

set -e

echo "=========================================="
echo "  营销AI智能体系统 - 系统测试"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "测试 $name... "
    
    if command -v curl > /dev/null; then
        status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    elif command -v wget > /dev/null; then
        status_code=$(wget --spider -S "$url" 2>&1 | grep "HTTP/" | awk '{print $2}' | tail -1)
    else
        echo -e "${YELLOW}跳过 (需要curl或wget)${NC}"
        return 1
    fi
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ 成功 ($status_code)${NC}"
        return 0
    else
        echo -e "${RED}✗ 失败 (期望 $expected_status, 实际 $status_code)${NC}"
        return 1
    fi
}

test_docker_service() {
    local service=$1
    
    echo -n "检查Docker服务 $service... "
    
    if docker-compose -f docker/docker-compose.yml ps | grep -q "$service.*Up"; then
        echo -e "${GREEN}✓ 运行中${NC}"
        return 0
    else
        echo -e "${RED}✗ 未运行${NC}"
        return 1
    fi
}

test_database() {
    echo -n "测试数据库连接... "
    
    if docker-compose -f docker/docker-compose.yml exec postgres pg_isready -U marketing_ai_user > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 连接正常${NC}"
        return 0
    else
        echo -e "${RED}✗ 连接失败${NC}"
        return 1
    fi
}

test_redis() {
    echo -n "测试Redis连接... "
    
    if docker-compose -f docker/docker-compose.yml exec redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 连接正常${NC}"
        return 0
    else
        echo -e "${RED}✗ 连接失败${NC}"
        return 1
    fi
}

# 检查依赖
echo "🔍 检查系统依赖..."
if ! command -v docker > /dev/null; then
    echo -e "${RED}❌ Docker未安装${NC}"
    exit 1
fi

if ! command -v docker-compose > /dev/null; then
    echo -e "${RED}❌ Docker Compose未安装${NC}"
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker未运行${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 所有依赖检查通过${NC}"

# 启动测试服务
echo ""
echo "🚀 启动测试环境..."
docker-compose -f docker/docker-compose.yml up -d postgres redis backend

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 运行测试
echo ""
echo "🧪 开始测试..."

PASS_COUNT=0
FAIL_COUNT=0

# 测试Docker服务
test_docker_service "postgres" && ((PASS_COUNT++)) || ((FAIL_COUNT++))
test_docker_service "redis" && ((PASS_COUNT++)) || ((FAIL_COUNT++))
test_docker_service "backend" && ((PASS_COUNT++)) || ((FAIL_COUNT++))

# 测试数据库连接
test_database && ((PASS_COUNT++)) || ((FAIL_COUNT++))

# 测试Redis连接
test_redis && ((PASS_COUNT++)) || ((FAIL_COUNT++))

# 测试后端API端点
echo ""
echo "🌐 测试API端点..."

test_endpoint "健康检查" "http://localhost:3000/health" "200" && ((PASS_COUNT++)) || ((FAIL_COUNT++))
test_endpoint "数据库健康检查" "http://localhost:3000/health/db" "200" && ((PASS_COUNT++)) || ((FAIL_COUNT++))
test_endpoint "Redis健康检查" "http://localhost:3000/health/redis" "200" && ((PASS_COUNT++)) || ((FAIL_COUNT++))
test_endpoint "API文档" "http://localhost:3000/api/docs" "200" && ((PASS_COUNT++)) || ((FAIL_COUNT++))

# 测试Prisma Studio
test_endpoint "Prisma Studio" "http://localhost:5555" "200" && ((PASS_COUNT++)) || ((FAIL_COUNT++))

# 停止测试服务
echo ""
echo "🛑 停止测试环境..."
docker-compose -f docker/docker-compose.yml down

# 显示测试结果
echo ""
echo "=========================================="
echo "           测试结果汇总"
echo "=========================================="
echo -e "总测试数: $((PASS_COUNT + FAIL_COUNT))"
echo -e "${GREEN}通过: $PASS_COUNT${NC}"
echo -e "${RED}失败: $FAIL_COUNT${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ 所有测试通过！系统准备就绪。${NC}"
else
    echo -e "${RED}❌ 有测试失败，请检查问题。${NC}"
    exit 1
fi

echo "=========================================="