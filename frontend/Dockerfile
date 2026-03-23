# 开发环境Dockerfile
FROM node:18-alpine AS development

# 设置工作目录
WORKDIR /app

# 复制package.json文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 5173

# 开发环境命令
CMD ["npm", "run", "dev", "--", "--host"]

# ======================
# 生产构建阶段
# ======================
FROM node:18-alpine AS build

WORKDIR /app

# 复制package.json文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# ======================
# 生产运行阶段
# ======================
FROM nginx:alpine AS production

# 复制构建产物到nginx目录
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制nginx配置
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# 生产环境命令
CMD ["nginx", "-g", "daemon off;"]