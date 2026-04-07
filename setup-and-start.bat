@echo off
chcp 65001 > nul
echo ========================================
echo   营销AI智能体系统 - 完整安装启动
echo ========================================
echo.

cd /d "%~dp0"

:: 设置国内镜像
npm config set registry https://registry.npmmirror.com
echo ✅ 已设置 npm 国内镜像
echo.

:: 检查 Node.js
echo [1/8] 检查 Node.js 环境...
node --version > nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到 Node.js
    echo 请从 https://nodejs.org/ 下载安装 Node.js 18+
    pause
    exit /b 1
)
echo ✅ Node.js 版本: 
node --version
echo.

:: 安装后端依赖
echo [2/8] 安装后端依赖...
cd backend
if exist node_modules (
    echo ✅ 后端依赖已存在，跳过安装
) else (
    echo 正在安装后端依赖，请稍候...
    call npm install 2>&1
    if errorlevel 1 (
        echo ❌ 后端依赖安装失败
        echo 尝试清除缓存后重新安装...
        call npm cache clean --force
        call npm install 2>&1
        if errorlevel 1 (
            echo ❌ 后端依赖安装仍然失败
            pause
            exit /b 1
        )
    )
    echo ✅ 后端依赖安装完成
)
echo.

:: 生成 Prisma 客户端
echo [3/8] 生成 Prisma 客户端...
if exist node_modules\@prisma\client (
    echo ✅ Prisma 客户端已存在
) else (
    echo 正在生成 Prisma 客户端...
    call npx prisma generate 2>&1
    if errorlevel 1 (
        echo ⚠️  Prisma 客户端生成失败（可能缺少 schema 或数据库连接问题）
        echo 继续启动...
    ) else (
        echo ✅ Prisma 客户端生成完成
    )
)
echo.

:: 安装前端依赖
echo [4/8] 安装前端依赖...
cd ..\frontend
if exist node_modules (
    echo ✅ 前端依赖已存在，跳过安装
) else (
    echo 正在安装前端依赖，请稍候...
    call npm install 2>&1
    if errorlevel 1 (
        echo ❌ 前端依赖安装失败
        echo 尝试清除缓存后重新安装...
        call npm cache clean --force
        call npm install 2>&1
        if errorlevel 1 (
            echo ❌ 前端依赖安装仍然失败
            pause
            exit /b 1
        )
    )
    echo ✅ 前端依赖安装完成
)
echo.

:: 检查关键文件
echo [5/8] 检查关键文件...
cd ..
if not exist "backend\src\main.ts" (
    echo ❌ 错误: 后端入口文件不存在
    pause
    exit /b 1
)
if not exist "frontend\src\main.ts" (
    echo ❌ 错误: 前端入口文件不存在
    pause
    exit /b 1
)
echo ✅ 关键文件检查通过
echo.

:: 检查环境变量
echo [6/8] 检查环境变量配置...
if not exist "backend\.env" (
    echo ⚠️  警告: 后端 .env 文件不存在，使用 .env.example
    copy backend\.env.example backend\.env > nul 2>&1
)
if not exist "frontend\.env" (
    echo ⚠️  警告: 前端 .env 文件不存在，使用 .env.example
    copy frontend\.env.example frontend\.env > nul 2>&1
)
echo ✅ 环境变量配置完成
echo.

:: 显示启动信息
echo [7/8] 准备启动服务器...
echo.
echo ========================================
echo   即将启动开发服务器
echo ========================================
echo.
echo 📱 前端地址: http://localhost:5173
echo 🔧 后端地址: http://localhost:3000
echo 📚 API文档: http://localhost:3000/api/docs
echo.
echo 提示:
echo - 首次启动可能需要 1-2 分钟
echo - 请等待两个服务器都启动完成
echo - 按 Ctrl+C 可以停止服务器
echo.
echo ========================================
echo.

:: 询问是否启动
echo [8/8] 是否立即启动服务器? (Y/N)
set /p choice=
if /i "%choice%"=="N" (
    echo 已取消启动
    pause
    exit /b 0
)

:: 启动服务器
echo.
echo 🚀 正在启动服务器...
echo.

:: 使用 start 命令在新窗口启动后端
echo 启动后端服务器...
start "后端服务器" cmd /k "cd /d "%~dp0backend" && npm run start:dev"

:: 等待几秒让后端启动
timeout /t 5 /nobreak > nul

:: 使用 start 命令在新窗口启动前端
echo 启动前端服务器...
start "前端服务器" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: 等待几秒
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo   服务器启动完成！
echo ========================================
echo.
echo 📱 前端: http://localhost:5173
echo 🔧 后端: http://localhost:3000
echo.
echo 两个新的命令行窗口已打开：
echo - [后端服务器] 窗口显示后端日志
echo - [前端服务器] 窗口显示前端日志
echo.
echo 请在新窗口中查看启动进度...
echo.

pause
