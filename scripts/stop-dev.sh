#!/bin/bash

# 营销AI智能体系统开发环境停止脚本

set -e

echo "=========================================="
echo "  营销AI智能体系统 - 停止开发环境"
echo "=========================================="

# 停止后端服务
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        echo "🛑 停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        sleep 2
    fi
    rm -f .backend.pid
fi

# 停止前端服务
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null; then
        echo "🛑 停止前端服务 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
        sleep 2
    fi
    rm -f .frontend.pid
fi

# 停止Prisma Studio
if [ -f ".prisma.pid" ]; then
    PRISMA_PID=$(cat .prisma.pid)
    if ps -p $PRISMA_PID > /dev/null; then
        echo "🛑 停止Prisma Studio (PID: $PRISMA_PID)..."
        kill $PRISMA_PID 2>/dev/null || true
        sleep 2
    fi
    rm -f .prisma.pid
fi

# 停止Docker服务
echo "🐳 停止Docker服务..."
docker-compose -f docker/docker-compose.yml down

echo "✅ 所有服务已停止"
echo "=========================================="