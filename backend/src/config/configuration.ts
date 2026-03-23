export default () => ({
  // 应用配置
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: 'Marketing AI Agent System',
  appVersion: process.env.APP_VERSION || '1.0.0',

  // 数据库配置
  database: {
    url: process.env.DATABASE_URL,
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
    timeout: parseInt(process.env.DATABASE_TIMEOUT || '5000', 10),
  },

  // Redis配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    ttl: parseInt(process.env.REDIS_TTL || '86400', 10), // 24小时
  },

  // Auth0配置
  auth0: {
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    audience: process.env.AUTH0_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '86400', // 24小时
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '604800', // 7天
  },

  // 智谱AI配置
  zhipuAi: {
    apiKey: process.env.ZHIPU_API_KEY,
    baseUrl: process.env.ZHIPU_API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
    textModel: process.env.ZHIPU_TEXT_MODEL || 'glm-4',
    imageModel: process.env.ZHIPU_IMAGE_MODEL || 'cogview-3',
    timeout: parseInt(process.env.ZHIPU_TIMEOUT || '30000', 10),
    maxTokens: parseInt(process.env.ZHIPU_MAX_TOKENS || '4096', 10),
    temperature: parseFloat(process.env.ZHIPU_TEMPERATURE || '0.7'),
  },

  // 文件上传配置
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },

  // 任务队列配置
  queue: {
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
    attempts: parseInt(process.env.QUEUE_ATTEMPTS || '3', 10),
    backoffDelay: parseInt(process.env.QUEUE_BACKOFF_DELAY || '5000', 10),
  },

  // 速率限制配置
  throttler: {
    ttl: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1分钟
    limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // CORS配置
  cors: {
    origins: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:5173'],
  },

  // 日志配置
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '30', 10),
    maxSize: process.env.LOG_MAX_SIZE || '10m',
  },

  // 监控配置
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    prometheusEndpoint: process.env.PROMETHEUS_ENDPOINT || '/metrics',
  },

  // 功能开关
  features: {
    enableAi: process.env.ENABLE_AI_FEATURES !== 'false',
    enableEmail: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    enableFileUpload: process.env.ENABLE_FILE_UPLOAD !== 'false',
  },

  // 邮件配置
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@marketing-ai.com',
    secure: process.env.SMTP_SECURE === 'true',
  },
});