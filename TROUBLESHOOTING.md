# 故障排查指南

## 常见问题及解决方案

### 问题 1: npm install 失败

**症状**:
```
npm ERR! code ETARGET
npm ERR! notarget No matching version found
```

**解决方案**:
```bash
# 1. 清除缓存
npm cache clean --force

# 2. 使用国内镜像
npm config set registry https://registry.npmmirror.com

# 3. 删除 node_modules 重新安装
cd backend
rd /s /q node_modules
del package-lock.json
npm install
```

---

### 问题 2: 启动时报错 "Cannot find module"

**症状**:
```
Error: Cannot find module '@nestjs/common'
```

**解决方案**:
```bash
# 依赖未安装，执行安装
cd backend
npm install

cd ../frontend
npm install
```

---

### 问题 3: 端口被占用

**症状**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**:
```bash
# Windows: 查找占用端口的进程
netstat -ano | findstr :3000

# 结束进程
taskkill /PID <进程ID> /F

# 或者修改端口（backend/.env）
PORT=3001
```

---

### 问题 4: 环境变量验证失败

**症状**:
```
环境变量验证失败: 缺少必要的环境变量: DATABASE_URL, AUTH0_DOMAIN...
```

**解决方案**:
已修复！现在环境变量都是可选的，使用默认值。

如果仍有问题，检查 `.env` 文件是否存在：
```bash
# 检查文件
cd backend
if not exist .env (
    copy .env.example .env
)
```

---

### 问题 5: Prisma 客户端未生成

**症状**:
```
Error: @prisma/client did not initialize yet
```

**解决方案**:
```bash
cd backend
npx prisma generate
```

---

### 问题 6: 数据库连接失败

**症状**:
```
Error: Can't reach database server at...
```

**解决方案**:
1. 检查网络连接
2. 确认数据库配置正确
3. 检查防火墙设置

```bash
# 测试数据库连接
cd backend
npx prisma db pull
```

---

### 问题 7: 前端无法访问后端 API

**症状**:
浏览器控制台显示 CORS 错误或 404

**解决方案**:
1. 确保后端已启动
2. 检查 CORS 配置
3. 确认代理配置正确

```bash
# 检查后端是否运行
curl http://localhost:3000/api/health
```

---

### 问题 8: TypeScript 编译错误

**症状**:
```
error TS2307: Cannot find module
```

**解决方案**:
```bash
# 重新安装依赖
cd backend
rd /s /q node_modules
del package-lock.json
npm install

# 重新生成 Prisma 客户端
npx prisma generate
```

---

### 问题 9: 内存不足

**症状**:
```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**解决方案**:
```bash
# 增加 Node.js 内存限制
set NODE_OPTIONS=--max-old-space-size=4096

# 然后启动
npm run start:dev
```

---

### 问题 10: 权限错误

**症状**:
```
Error: EPERM: operation not permitted
```

**解决方案**:
```bash
# 以管理员身份运行命令提示符
# 或者修改文件夹权限
```

---

## 启动步骤检查清单

### 第一次启动

1. ✅ 安装 Node.js 18+
2. ✅ 克隆/下载项目
3. ✅ 运行 `quick-start.bat`
4. ✅ 等待依赖安装完成
5. ✅ 查看新窗口中的启动日志
6. ✅ 访问 http://localhost:5173

### 日常启动

1. ✅ 双击 `quick-start.bat`
2. ✅ 等待两个服务器启动
3. ✅ 访问 http://localhost:5173

---

## 快速诊断命令

### 检查 Node.js
```bash
node --version
npm --version
```

### 检查依赖
```bash
cd backend
npm list --depth=0

cd ../frontend
npm list --depth=0
```

### 检查端口
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5173
```

### 测试后端
```bash
curl http://localhost:3000/api/health
```

### 测试前端
```bash
# 在浏览器中打开
http://localhost:5173
```

---

## 重置项目

如果问题无法解决，可以重置项目：

```bash
# 1. 删除所有依赖
cd backend
rd /s /q node_modules
del package-lock.json

cd ../frontend
rd /s /q node_modules
del package-lock.json

# 2. 清除 npm 缓存
npm cache clean --force

# 3. 重新安装
cd ../backend
npm install

cd ../frontend
npm install

# 4. 重新启动
cd ..
quick-start.bat
```

---

## 获取帮助

如果以上方法都无法解决问题：

1. 查看错误日志的完整信息
2. 检查 Node.js 和 npm 版本
3. 确认所有配置文件正确
4. 尝试在全新的命令行窗口中运行

---

## 联系支持

- 查看项目文档：`docs/` 目录
- 检查配置文件：`.env` 文件
- 查看日志：控制台输出

---

**最后更新**: 2024-03-23
