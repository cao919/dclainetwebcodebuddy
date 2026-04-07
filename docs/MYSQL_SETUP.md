# MySQL 数据库对接指南

## 已完成的配置修改

### 1. Prisma Schema 更新

已将 `backend/prisma/schema.prisma` 从 PostgreSQL 切换到 MySQL：

- **DataSource**: `postgresql` → `mysql`
- **数据类型**: 移除 `@db.Uuid`，使用 MySQL 兼容的字符串类型
- **扩展**: 移除 PostgreSQL 特有扩展 (`pg_trgm`, `uuid_ossp`)
- **预览功能**: 更新为 MySQL 兼容功能

### 2. 环境变量配置

已更新以下配置文件：

#### `.env.example`
```env
DATABASE_URL="mysql://sa:Admin1q2w%23E@sh-cynosdbmysql-grp-b2tjwrek.sql.tencentcdb.com:20604/txcloudbase-2gr4y00s7a994ecd"
```

#### `backend/.env`
```env
DATABASE_URL="mysql://sa:Admin1q2w%23E@sh-cynosdbmysql-grp-b2tjwrek.sql.tencentcdb.com:20604/txcloudbase-2gr4y00s7a994ecd"
```

#### `frontend/.env`
前端环境变量配置文件已创建

### 3. Docker Compose 更新

已更新 `docker/docker-compose.yml`：
- **PostgreSQL** → **MySQL 8.0**
- 更新服务依赖和健康检查
- 更新所有数据库连接字符串

## 数据库连接信息

- **数据库类型**: MySQL 8.0
- **主机**: `sh-cynosdbmysql-grp-b2tjwrek.sql.tencentcdb.com`
- **端口**: `20604`
- **数据库**: `txcloudbase-2gr4y00s7a994ecd`
- **用户名**: `sa`
- **密码**: `Admin1q2w#E`

连接字符串（已编码）:
```
mysql://sa:Admin1q2w%23E@sh-cynosdbmysql-grp-b2tjwrek.sql.tencentcdb.com:20604/txcloudbase-2gr4y00s7a994ecd
```

## 执行步骤

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 生成 Prisma 客户端

```bash
cd backend
npx prisma generate
```

### 3. 运行数据库迁移

```bash
cd backend
npx prisma migrate dev --name init
```

### 4. （可选）生成 Prisma Client

```bash
cd backend
npx prisma generate
```

### 5. 测试数据库连接

```bash
cd backend
npx prisma db push
```

### 6. （可选）使用 Prisma Studio 查看数据库

```bash
cd backend
npx prisma studio
```

## 数据库表结构

迁移后将在 MySQL 中创建以下表：

1. `marketing_task` - 营销任务主表
2. `task_stage_output` - 任务阶段输出表
3. `ad_creative` - 广告创意表
4. `marketing_performance` - 营销效果表
5. `users` - 用户表
6. `system_config` - 系统配置表
7. `audit_log` - 审计日志表
8. `task_overview` - 任务概览视图
9. `creative_performance_view` - 创意效果视图

## 注意事项

### 1. URL 编码

密码中的特殊字符 `#` 已进行 URL 编码为 `%23`。如果手动构建连接字符串，请确保正确编码特殊字符。

### 2. 数据库权限

确保 `sa` 用户具有以下权限：
- CREATE, ALTER, DROP (表结构管理)
- SELECT, INSERT, UPDATE, DELETE (数据操作)
- INDEX (索引管理)
- CREATE VIEW, DROP VIEW (视图管理)

### 3. MySQL 版本

确保 MySQL 版本为 8.0 或更高，以支持 JSON 类型和更好的性能。

### 4. 字符集

推荐使用 `utf8mb4` 字符集，以支持完整的 Unicode 字符（包括表情符号）。

### 5. 时区设置

确保 MySQL 服务器时区设置正确，避免日期时间数据出现问题。

## 开发环境启动

### 使用 Docker Compose（本地 MySQL）

```bash
# 启动所有服务
docker-compose -f docker/docker-compose.yml up -d

# 查看日志
docker-compose -f docker/docker-compose.yml logs -f
```

### 使用腾讯云 MySQL

直接使用配置好的 `.env` 文件启动：

```bash
# 启动后端
cd backend
npm run start:dev

# 启动前端
cd frontend
npm run dev
```

## 故障排查

### 问题 1: 连接被拒绝

**原因**: 数据库连接信息错误或网络问题

**解决方案**:
- 检查连接字符串中的主机、端口、用户名、密码
- 确认数据库服务器可访问
- 检查防火墙设置

### 问题 2: 认证失败

**原因**: 用户名或密码错误

**解决方案**:
- 验证用户名 `sa` 和密码 `Admin1q2w#E`
- 确认密码中的特殊字符已正确编码

### 问题 3: 权限不足

**原因**: 用户权限不足

**解决方案**:
- 联系数据库管理员授予必要权限
- 或使用具有完整权限的账户

### 问题 4: 迁移失败

**原因**: 表已存在或权限不足

**解决方案**:
```bash
# 强制重置数据库（会删除所有数据）
npx prisma migrate reset

# 或使用 db push（不创建迁移历史）
npx prisma db push
```

## 生产环境部署

在生产环境中，建议：

1. 使用环境变量管理工具（如 AWS Secrets Manager、Azure Key Vault）
2. 配置 SSL 连接（在连接字符串添加 `?sslmode=require`）
3. 使用连接池
4. 配置数据库备份策略
5. 启用慢查询日志和性能监控

## 相关资源

- [Prisma MySQL 文档](https://www.prisma.io/docs/concepts/database-connectors/mysql)
- [MySQL 8.0 参考手册](https://dev.mysql.com/doc/refman/8.0/en/)
- [腾讯云 MySQL 文档](https://cloud.tencent.com/document/product/236)
