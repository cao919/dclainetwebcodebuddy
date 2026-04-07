import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsBoolean, IsUrl, validateSync, Min, Max } from 'class-validator';

class EnvironmentVariables {
  // 应用配置
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT?: number;

  @IsOptional()
  @IsString()
  NODE_ENV?: string;

  // 数据库配置
  @IsOptional()
  @IsString()
  DATABASE_URL?: string;

  // Redis配置
  @IsOptional()
  @IsString()
  REDIS_URL?: string;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  // Auth0配置
  @IsOptional()
  @IsString()
  AUTH0_DOMAIN?: string;

  @IsOptional()
  @IsString()
  AUTH0_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  AUTH0_CLIENT_SECRET?: string;

  @IsOptional()
  @IsString()
  AUTH0_AUDIENCE?: string;

  // JWT配置
  @IsOptional()
  @IsString()
  JWT_SECRET?: string;

  // 智谱AI配置
  @IsOptional()
  @IsString()
  ZHIPU_API_KEY?: string;

  @IsOptional()
  @IsUrl()
  ZHIPU_API_BASE_URL?: string;

  // 文件上传配置
  @IsOptional()
  @IsNumber()
  MAX_FILE_SIZE?: number;

  // 邮件配置
  @IsOptional()
  @IsString()
  SMTP_HOST?: string;

  @IsOptional()
  @IsNumber()
  SMTP_PORT?: number;

  @IsOptional()
  @IsString()
  SMTP_USER?: string;

  @IsOptional()
  @IsString()
  SMTP_PASSWORD?: string;

  // 功能开关
  @IsOptional()
  @IsBoolean()
  ENABLE_AI_FEATURES?: boolean;

  @IsOptional()
  @IsBoolean()
  ENABLE_EMAIL_NOTIFICATIONS?: boolean;

  // 日志配置
  @IsOptional()
  @IsString()
  LOG_LEVEL?: string;

  // CORS配置
  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: true,
  });

  if (errors.length > 0) {
    const invalidVars = errors
      .map(error => `${error.property}: ${Object.values(error.constraints || {}).join(', ')}`)
      .join('; ');

    console.warn('环境变量警告:', invalidVars);
  }

  return validatedConfig;
}