@echo off
chcp 65001 > nul
echo ========================================
echo   导出最新代码
echo ========================================
echo.

cd /d "%~dp0"

:: 获取当前时间戳
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

:: 设置导出文件名
set EXPORT_FILE=marketing-ai-code-%TIMESTAMP%.zip

echo [1/4] 准备导出代码...
echo 导出文件名: %EXPORT_FILE%
echo.

:: 检查 7zip 或 PowerShell
where 7z > nul 2>&1
if %errorlevel% == 0 (
    set ZIP_TOOL=7z
    echo ✅ 使用 7-Zip 压缩
) else (
    set ZIP_TOOL=powershell
    echo ✅ 使用 PowerShell 压缩
)
echo.

echo [2/4] 清理临时文件...
:: 删除 node_modules 和日志（不压缩这些）
if exist "backend\node_modules" (
    echo - 跳过 backend/node_modules
)
if exist "frontend\node_modules" (
    echo - 跳过 frontend/node_modules
)
if exist "*.log" (
    del /q *.log 2>nul
    echo - 清理日志文件
)
echo.

echo [3/4] 压缩代码...
if "%ZIP_TOOL%"=="7z" (
    :: 使用 7-Zip
    7z a -tzip "%EXPORT_FILE%" ^
        "backend\src" ^
        "backend\prisma" ^
        "backend\*.json" ^
        "backend\*.ts" ^
        "backend\*.js" ^
        "backend\.env*" ^
        "frontend\src" ^
        "frontend\*.html" ^
        "frontend\*.json" ^
        "frontend\*.ts" ^
        "frontend\.env*" ^
        "docker" ^
        "docs" ^
        "scripts" ^
        "*.md" ^
        "*.json" ^
        "*.bat" ^
        -xr!node_modules ^
        -xr!dist ^
        -xr!.git ^
        -xr!*.log
) else (
    :: 使用 PowerShell
    powershell -Command "
        $exclude = @('node_modules', 'dist', '.git', '*.log')
        Compress-Archive -Path 'backend', 'frontend', 'docker', 'docs', 'scripts', '*.md', '*.json', '*.bat' -DestinationPath '%EXPORT_FILE%' -Force
    "
)

if exist "%EXPORT_FILE%" (
    echo ✅ 代码导出成功: %EXPORT_FILE%
) else (
    echo ❌ 导出失败
    pause
    exit /b 1
)
echo.

echo [4/4] 生成代码清单...
set MANIFEST_FILE=code-manifest-%TIMESTAMP%.txt
echo 营销AI智能体系统 - 代码清单 > "%MANIFEST_FILE%"
echo 导出时间: %date% %time% >> "%MANIFEST_FILE%"
echo ======================================== >> "%MANIFEST_FILE%"
echo. >> "%MANIFEST_FILE%"

echo 【后端文件】 >> "%MANIFEST_FILE%"
dir /s /b backend\src\*.ts >> "%MANIFEST_FILE%" 2>nul
dir /s /b backend\prisma\* >> "%MANIFEST_FILE%" 2>nul
echo. >> "%MANIFEST_FILE%"

echo 【前端文件】 >> "%MANIFEST_FILE%"
dir /s /b frontend\src\*.ts >> "%MANIFEST_FILE%" 2>nul
dir /s /b frontend\src\*.vue >> "%MANIFEST_FILE%" 2>nul
echo. >> "%MANIFEST_FILE%"

echo 【配置文件】 >> "%MANIFEST_FILE%"
dir /b *.json >> "%MANIFEST_FILE%" 2>nul
dir /b *.md >> "%MANIFEST_FILE%" 2>nul
dir /b *.bat >> "%MANIFEST_FILE%" 2>nul
echo. >> "%MANIFEST_FILE%"

echo ✅ 代码清单已生成: %MANIFEST_FILE%
echo.

echo ========================================
echo   导出完成！
echo ========================================
echo.
echo 📦 代码包: %EXPORT_FILE%
echo 📋 清单文件: %MANIFEST_FILE%
echo.
echo 文件位置: %cd%\%EXPORT_FILE%
echo.
echo 包含内容:
echo - 后端源代码 (backend/src)
echo - 前端源代码 (frontend/src)
echo - 数据库配置 (prisma)
echo - Docker 配置
echo - 项目文档
echo - 启动脚本
echo.
echo 不包含:
echo - node_modules (依赖包)
echo - dist (构建文件)
echo - .git (版本控制)
echo - 日志文件
echo.

pause
