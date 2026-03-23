import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CreativesModule } from './modules/creatives/creatives.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiModule } from './modules/ai/ai.module';
import { SystemModule } from './modules/system/system.module';
import { HealthModule } from './health/health.module';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import configuration from './config/configuration';
import { validate } from './config/env.validation';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env', '.env.local'],
    }),

    // 速率限制
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('throttler.ttl', 60000),
            limit: config.get<number>('throttler.limit', 100),
          },
        ],
      }),
    }),

    // 定时任务
    ScheduleModule.forRoot(),

    // 事件发射器
    EventEmitterModule.forRoot(),

    // Redis队列
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('redis.host', 'localhost'),
          port: config.get<number>('redis.port', 6379),
          password: config.get<string>('redis.password'),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      }),
    }),

    // 数据库模块
    PrismaModule,

    // 业务模块
    AuthModule,
    TasksModule,
    CreativesModule,
    AnalyticsModule,
    AiModule,
    SystemModule,
    
    // 健康检查模块
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}