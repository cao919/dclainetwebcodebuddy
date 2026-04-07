@echo off
chcp 65001 > nul
echo ========================================
echo   营销AI智能体系统 - 简单启动
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 检查环境...
node --version > nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

:: 检查依赖
if not exist "backend\node_modules" (
    echo ❌ 后端依赖未安装，正在安装...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo ❌ 前端依赖未安装，正在安装...
    cd frontend
    call npm install
    cd ..
)
echo ✅ 依赖已安装
echo.

echo [2/3] 构建后端...
cd backend
call npx nest build
if errorlevel 1 (
    echo ❌ 后端构建失败
    pause
    exit /b 1
)
echo ✅ 后端构建成功
echo.

echo [3/3] 启动服务器...
echo.
echo ========================================
echo 启动信息：
echo ========================================
echo 后端: http://localhost:3000
echo 前端: http://localhost:5173
echo 健康检查: http://localhost:3000/health
echo.
echo 将打开两个窗口，请不要关闭！
echo.

:: 启动后端（生产模式，更稳定）
start "后端 - 端口3000" cmd /k "cd /d "%~dp0backend" && npm run start:prod"

:: 等待后端启动
timeout /t 3 /nobreak > nul

:: 启动前端
cd ..\frontend
start "前端 - 端口5173" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ✅ 启动命令已执行！
echo.
echo 请等待 5-10 秒让服务器完全启动
echo 然后访问：
echo   - 前端: http://localhost:5173
echo   - 后端: http://localhost:3000
echo   - 健康检查: http://localhost:3000/health
echo.

timeout /t 5 > nul

:: 测试后端是否启动
echo 测试后端连接...
curl -s http://localhost:3000/health > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 后端启动成功！
) else (
    echo ⏳ 后端正在启动中，请稍后再试访问...
)
echo.

pause
