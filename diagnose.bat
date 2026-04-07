@echo off
chcp 65001 > nul
echo ========================================
echo   启动问题诊断工具
echo ========================================
echo.

cd /d "%~dp0"

echo [1/8] 检查 Node.js...
node --version 2>nul
if errorlevel 1 (
    echo ❌ Node.js 未安装
    pause
    exit /b 1
)
echo ✅ Node.js 正常
echo.

echo [2/8] 检查后端依赖...
cd backend
if not exist node_modules (
    echo ❌ 后端依赖未安装
    echo 正在安装...
    call npm install
) else (
    echo ✅ 后端依赖已安装
)
echo.

echo [3/8] 检查前端依赖...
cd ..\frontend
if not exist node_modules (
    echo ❌ 前端依赖未安装
    echo 正在安装...
    call npm install
) else (
    echo ✅ 前端依赖已安装
)
echo.

echo [4/8] 检查 TypeScript 编译...
cd ..\backend
echo 检查后端 TypeScript...
call npx tsc --noEmit 2>nul
if errorlevel 1 (
    echo ❌ 后端有 TypeScript 错误
    echo 尝试修复...
) else (
    echo ✅ 后端 TypeScript 正常
)
echo.

echo [5/8] 检查端口占用...
echo 检查端口 3000...
netstat -ano | findstr :3000 > nul
if %errorlevel% == 0 (
    echo ⚠️  端口 3000 被占用
    echo 请关闭占用该端口的程序
) else (
    echo ✅ 端口 3000 可用
)

echo 检查端口 5173...
netstat -ano | findstr :5173 > nul
if %errorlevel% == 0 (
    echo ⚠️  端口 5173 被占用
) else (
    echo ✅ 端口 5173 可用
)
echo.

echo [6/8] 检查环境变量...
cd ..\backend
if not exist .env (
    echo ⚠️  .env 文件不存在
    echo 创建默认配置...
    echo PORT=3000 > .env
    echo NODE_ENV=development >> .env
    echo DATABASE_URL="mysql://sa:Admin1q2w%%23E@sh-cynosdbmysql-grp-b2tjwrek.sql.tencentcdb.com:20604/txcloudbase-2gr4y00s7a994ecd" >> .env
    echo ✅ 已创建默认 .env
) else (
    echo ✅ .env 文件存在
)
echo.

echo [7/8] 测试后端启动...
echo 尝试编译后端...
cd backend
call npx tsc --noEmit > compile.log 2>&1
if errorlevel 1 (
    echo ❌ 编译失败，查看 compile.log
    type compile.log
) else (
    echo ✅ 编译成功
    del compile.log 2>nul
)
echo.

echo [8/8] 生成诊断报告...
echo 生成报告...
echo 诊断时间: %date% %time% > diagnose-report.txt
echo. >> diagnose-report.txt
echo 项目路径: %cd% >> diagnose-report.txt
echo. >> diagnose-report.txt
echo 【Node.js 版本】 >> diagnose-report.txt
node --version >> diagnose-report.txt 2>&1
echo. >> diagnose-report.txt
echo 【npm 版本】 >> diagnose-report.txt
npm --version >> diagnose-report.txt 2>&1
echo. >> diagnose-report.txt
echo 【后端依赖】 >> diagnose-report.txt
if exist backend\node_modules (
    echo 已安装 >> diagnose-report.txt
) else (
    echo 未安装 >> diagnose-report.txt
)
echo. >> diagnose-report.txt
echo 【前端依赖】 >> diagnose-report.txt
if exist frontend\node_modules (
    echo 已安装 >> diagnose-report.txt
) else (
    echo 未安装 >> diagnose-report.txt
)
echo. >> diagnose-report.txt
echo 【环境变量】 >> diagnose-report.txt
if exist backend\.env (
    echo 已配置 >> diagnose-report.txt
) else (
    echo 未配置 >> diagnose-report.txt
)
echo. >> diagnose-report.txt
echo 【端口状态】 >> diagnose-report.txt
netstat -ano | findstr :3000 >> diagnose-report.txt 2>&1
netstat -ano | findstr :5173 >> diagnose-report.txt 2>&1
echo. >> diagnose-report.txt

echo ✅ 诊断报告已生成: diagnose-report.txt
echo.

echo ========================================
echo   诊断完成！
echo ========================================
echo.
echo 查看 diagnose-report.txt 获取详细信息
echo.
echo 常见问题：
echo 1. 端口被占用 - 关闭占用 3000/5173 的程序
echo 2. 依赖未安装 - 运行 npm install
echo 3. TypeScript 错误 - 检查代码语法
echo.

pause
