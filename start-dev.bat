@echo off
chcp 65001 > nul
echo ========================================
echo   营销AI智能体系统 - 开发服务器启动
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] 检查 Node.js 环境...
node --version > nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到 Node.js，请先安装 Node.js 18+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js 版本:
node --version
echo ✅ npm 版本:
npm --version
echo.

echo [2/5] 安装后端依赖...
cd backend
if not exist "node_modules" (
    echo 正在安装后端依赖...
    call npm install
    if errorlevel 1 (
        echo ❌ 后端依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 后端依赖安装完成
) else (
    echo ✅ 后端依赖已存在
)
echo.

echo [3/5] 生成 Prisma 客户端...
if not exist "node_modules\@prisma\client" (
    echo 正在生成 Prisma 客户端...
    call npx prisma generate
    if errorlevel 1 (
        echo ❌ Prisma 客户端生成失败
        echo 提示: 请确保数据库连接信息正确
        pause
        exit /b 1
    )
    echo ✅ Prisma 客户端生成完成
) else (
    echo ✅ Prisma 客户端已存在
)
echo.

echo [4/5] 安装前端依赖...
cd ..\frontend
if not exist "node_modules" (
    echo 正在安装前端依赖...
    call npm install
    if errorlevel 1 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 前端依赖安装完成
) else (
    echo ✅ 前端依赖已存在
)
echo.

echo [5/5] 启动开发服务器...
echo.
echo ========================================
echo   正在启动前后端服务器...
echo ========================================
echo.
echo 📱 前端地址: http://localhost:5173
echo 🔧 后端地址: http://localhost:3000
echo 📚 API文档: http://localhost:3000/api/docs
echo.
echo 提示: 请等待服务器完全启动后再访问
echo 按 Ctrl+C 可停止服务器
echo.
echo ========================================
cd ..
call npm run dev

pause
