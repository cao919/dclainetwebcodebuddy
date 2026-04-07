@echo off
chcp 65001 > nul
echo ========================================
echo   保存代码修改到 Git
echo ========================================
echo.

cd /d "%~dp0"

:: 检查 Git
git --version > nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到 Git
    echo 请安装 Git: https://git-scm.com/
    pause
    exit /b 1
)

echo [1/5] 检查 Git 状态...
git status --short
echo.

echo [2/5] 添加所有修改...
git add -A
echo ✅ 已添加所有修改
echo.

echo [3/5] 创建提交...
set TIMESTAMP=%date:~0,4%-%date:~5,2%-%date:~8,2% %time:~0,5%
git commit -m "更新: MySQL配置和项目优化 - %TIMESTAMP%"
if errorlevel 1 (
    echo ⚠️  没有需要提交的修改，或提交失败
    echo.
    echo 可能的解决方案:
    echo 1. 检查是否有修改: git status
    echo 2. 配置 Git 用户名和邮箱:
    echo    git config user.name "Your Name"
    echo    git config user.email "your@email.com"
    pause
    exit /b 1
)
echo ✅ 提交成功
echo.

echo [4/5] 推送到远程仓库...
echo 是否推送到远程仓库? (Y/N)
set /p choice=
if /i "%choice%"=="Y" (
    git push origin main
    if errorlevel 1 (
        echo ⚠️  推送失败，可能需要配置远程仓库
    ) else (
        echo ✅ 推送成功
    )
) else (
    echo 已跳过推送
)
echo.

echo [5/5] 生成提交日志...
git log --oneline -10 > latest-commits.txt
echo ✅ 提交日志已保存到: latest-commits.txt
echo.

echo ========================================
echo   保存完成！
echo ========================================
echo.
echo 最近的提交:
git log --oneline -3
echo.

pause
