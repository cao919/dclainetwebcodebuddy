@echo off
chcp 65001 > nul
echo ========================================
echo   营销AI智能体系统 - 快速启动
echo ========================================
echo.

cd /d "%~dp0"

:: 设置国内镜像
npm config set registry https://registry.npmmirror.com > nul 2>&1

:: 检查 Node.js
echo [1/4] 检查 Node.js...
node --version > nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到 Node.js，请先安装
    pause
    exit /b 1
)
echo ✅ Node.js 已安装
echo.

:: 安装后端依赖
echo [2/4] 安装后端依赖（首次需要几分钟）...
cd backend
if not exist node_modules (
    echo 正在安装，请稍候...
    call npm install
    if errorlevel 1 (
        echo ❌ 安装失败，尝试清除缓存...
        call npm cache clean --force
        call npm install
    )
)
echo ✅ 后端依赖就绪
echo.

:: 安装前端依赖
echo [3/4] 安装前端依赖（首次需要几分钟）...
cd ..\frontend
if not exist node_modules (
    echo 正在安装，请稍候...
    call npm install
    if errorlevel 1 (
        echo ❌ 安装失败，尝试清除缓存...
        call npm cache clean --force
        call npm install
    )
)
echo ✅ 前端依赖就绪
echo.

:: 启动服务器
echo [4/4] 启动服务器...
echo.
echo ========================================
echo   启动信息
echo ========================================
echo.
echo 📱 前端: http://localhost:5173
echo 🔧 后端: http://localhost:3000
echo.
echo 将打开两个新窗口：
echo - 后端服务器窗口（端口 3000）
echo - 前端服务器窗口（端口 5173）
echo.

:: 启动后端
cd ..\backend
start "后端服务器 - 端口3000" cmd /k "npm run start:dev"

:: 等待后端启动
timeout /t 3 /nobreak > nul

:: 启动前端
cd ..\frontend
start "前端服务器 - 端口5173" cmd /k "npm run dev"

echo.
echo ✅ 服务器启动命令已执行！
echo 请在新窗口中查看启动进度...
echo.
echo 访问地址：
echo - 前端: http://localhost:5173
echo - 后端: http://localhost:3000
echo - 健康检查: http://localhost:3000/api/health
echo.

pause
