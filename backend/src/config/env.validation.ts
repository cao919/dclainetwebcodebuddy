import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsBoolean, IsUrl, IsArray, validateSync, Min, Max } from 'class-validator';

class EnvironmentVariables {
  // 应用配置
  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT: number;

  @IsString()
  NODE_ENV: string;

  // 数据库配置
  @IsString()
  DATABASE_URL: string;

  // Redis配置
  @IsString()
  REDIS_URL: string;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  // Auth0配置
  @IsString()
  AUTH0_DOMAIN: string;

  @IsString()
  AUTH0_CLIENT_ID: string;

  @IsString()
  AUTH0_CLIENT_SECRET: string;

  @IsString()
  AUTH0_AUDIENCE: string;

  // JWT配置
  @IsString()
  JWT_SECRET: string;

  // 智谱AI配置
  @IsString()
  ZHIPU_API_KEY: string;

  @IsOptional()
  @IsUrl()
  ZHIPU_API_BASE_URL?: string;

  // 文件上传配置
  @IsOptional()
  @IsNumber()
  MAX_FILE_SIZE?: number;

  @IsOptional()
  @IsArray()
  ALLOWED_FILE_TYPES?: string[];

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
  @IsArray()
  CORS_ORIGIN?: string[];
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const missingVars = errors
      .filter(error => error.constraints?.isString || error.constraints?.isNumber)
      .map(error => error.property)
      .join(', ');

    const invalidVars = errors
      .filter(error => !error.constraints?.isString && !error.constraints?.isNumber)
      .map(error => `${error.property}: ${Object.values(error.constraints || {}).join(', ')}`)
      .join('; ');

    let errorMessage = '环境变量验证失败:\n';

    if (missingVars) {
      errorMessage += `缺少必要的环境变量: ${missingVars}\n`;
    }

    if (invalidVars) {
      errorMessage += `无效的环境变量值: ${invalidVars}\n`;
    }

    throw new Error(errorMessage);
  }

  return validatedConfig;
}