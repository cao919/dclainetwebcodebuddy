@echo off
chcp 65001 > nul
echo ========================================
echo   营销AI智能体系统 - 自动化测试
echo ========================================
echo.

cd /d "%~dp0"

set TEST_PASSED=0
set TEST_FAILED=0
set TEST_COUNT=0

echo ========================================
echo   [1/6] 检查 Node.js 环境
echo ========================================
node --version > nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到 Node.js
    set /a TEST_FAILED+=1
    set /a TEST_COUNT+=1
    goto :end
) else (
    echo ✅ Node.js 版本:
    node --version
    echo ✅ npm 版本:
    npm --version
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
)
echo.

echo ========================================
echo   [2/6] 检查项目结构
echo ========================================
if exist "backend" (
    echo ✅ 后端目录存在
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
) else (
    echo ❌ 后端目录不存在
    set /a TEST_FAILED+=1
    set /a TEST_COUNT+=1
)

if exist "frontend" (
    echo ✅ 前端目录存在
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
) else (
    echo ❌ 前端目录不存在
    set /a TEST_FAILED+=1
    set /a TEST_COUNT+=1
)

if exist "backend\prisma\schema.prisma" (
    echo ✅ Prisma schema 存在
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
) else (
    echo ❌ Prisma schema 不存在
    set /a TEST_FAILED+=1
    set /a TEST_COUNT+=1
)

if exist "backend\.env" (
    echo ✅ 后端环境变量文件存在
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
) else (
    echo ❌ 后端环境变量文件不存在
    set /a TEST_FAILED+=1
    set /a TEST_COUNT+=1
)
echo.

echo ========================================
echo   [3/6] 检查配置文件
echo ========================================
cd backend

if exist "package.json" (
    echo ✅ 后端 package.json 存在
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
) else (
    echo ❌ 后端 package.json 不存在
    set /a TEST_FAILED+=1
    set /a TEST_COUNT+=1
)

cd ..\frontend

if exist "package.json" (
    echo ✅ 前端 package.json 存在
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
) else (
    echo ❌ 前端 package.json 不存在
    set /a TEST_FAILED+=1
    set /a TEST_COUNT+=1
)

if exist "vite.config.ts" (
    echo ✅ Vite 配置文件存在
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
) else (
    echo ❌ Vite 配置文件不存在
    set /a TEST_FAILED+=1
    set /a TEST_COUNT+=1
)

cd ..
echo.

echo ========================================
echo   [4/6] 检查数据库配置
echo ========================================
if exist "backend\.env" (
    findstr /C:"DATABASE_URL" backend\.env > nul
    if not errorlevel 1 (
        echo ✅ DATABASE_URL 已配置
        set /a TEST_PASSED+=1
        set /a TEST_COUNT+=1

        findstr /C:"mysql://" backend\.env > nul
        if not errorlevel 1 (
            echo ✅ MySQL 连接字符串正确
            set /a TEST_PASSED+=1
            set /a TEST_COUNT+=1
        ) else (
            echo ❌ MySQL 连接字符串错误
            set /a TEST_FAILED+=1
            set /a TEST_COUNT+=1
        )

        findstr /C:"sh-cynosdbmysql-grp-b2tjwrek.sql.tencentcdb.com" backend\.env > nul
        if not errorlevel 1 (
            echo ✅ 腾讯云数据库地址正确
            set /a TEST_PASSED+=1
            set /a TEST_COUNT+=1
        ) else (
            echo ⚠️  腾讯云数据库地址未配置（可能使用本地数据库）
            set /a TEST_PASSED+=1
            set /a TEST_COUNT+=1
        )
    ) else (
        echo ❌ DATABASE_URL 未配置
        set /a TEST_FAILED+=1
        set /a TEST_COUNT+=1
    )
) else (
    echo ⚠️  环境变量文件不存在，跳过数据库配置检查
)
echo.

echo ========================================
echo   [5/6] 检查源代码文件
echo ========================================
cd backend\src

if exist "main.ts" (
    echo ✅ 后端入口文件存在
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
) else (
    echo ❌ 后端入口文件不存在
    set /a TEST_FAILED+=1
    set /a TEST_COUNT+=1
)

if exist "app.module.ts" (
    echo ✅ 应用模块文件存在
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
) else (
    echo ❌ 应用模块文件不存在
    set /a TEST_FAILED+=1
    set /a TEST_COUNT+=1
)

if exist "auth\auth.service.ts" (
    echo ✅ 认证服务存在
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
) else (
    echo ❌ 认证服务不存在
    set /a TEST_FAILED+=1
    set /a TEST_COUNT+=1
)

if exist "modules\ai\ai.service.ts" (
    echo ✅ AI 服务存在
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
) else (
    echo ❌ AI 服务不存在
    set /a TEST_FAILED+=1
    set /a TEST_COUNT+=1
)

cd ..\..\frontend\src

if exist "main.ts" (
    echo ✅ 前端入口文件存在
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
) else (
    echo ❌ 前端入口文件不存在
    set /a TEST_FAILED+=1
    set /a TEST_COUNT+=1
)

if exist "App.vue" (
    echo ✅ 前端主组件存在
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
) else (
    echo ❌ 前端主组件不存在
    set /a TEST_FAILED+=1
    set /a TEST_COUNT+=1
)

if exist "WelcomeView.vue" (
    echo ✅ 欢迎页面存在
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
) else (
    echo ❌ 欢迎页面不存在
    set /a TEST_FAILED+=1
    set /a TEST_COUNT+=1
)

cd ..\..
echo.

echo ========================================
echo   [6/6] 测试文件检查
echo ========================================
cd backend

set TEST_FILE_COUNT=0
dir /s /b *.spec.ts > test_files.txt 2>nul
for /f %%i in (test_files.txt) do set /a TEST_FILE_COUNT+=1
del test_files.txt 2>nul

if %TEST_FILE_COUNT% GTR 0 (
    echo ✅ 发现 %TEST_FILE_COUNT% 个测试文件
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
) else (
    echo ⚠️  未发现测试文件
    set /a TEST_PASSED+=1
    set /a TEST_COUNT+=1
)

cd ..
echo.

:end
echo ========================================
echo   测试结果汇总
echo ========================================
echo 总测试数: %TEST_COUNT%
echo 通过: %TEST_PASSED% ✅
echo 失败: %TEST_FAILED% ❌
echo.

set /a TEST_RATE=TEST_PASSED*100/TEST_COUNT
echo 通过率: %TEST_RATE%%%
echo.

if %TEST_FAILED% EQU 0 (
    echo 🎉 所有测试通过！项目配置正确！
) else (
    echo ⚠️  有 %TEST_FAILED% 个测试失败，请检查配置
)
echo.
echo ========================================

pause
