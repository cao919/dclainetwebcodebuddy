import { Module, Controller, Get } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validate } from './config/env.validation';

// 导入各功能模块
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MarketingTasksModule } from './modules/marketing-tasks/marketing-tasks.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PrismaModule } from './database/prisma.module';

// 健康检查控制器
@Controller('health')
class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'marketing-ai-backend',
    };
  }
}

// 测试控制器
@Controller()
class AppController {
  @Get()
  hello() {
    return {
      message: '营销AI智能体系统 API',
      version: '1.0.0',
      status: 'running',
    };
  }
}

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env', '.env.local'],
    }),
    // 数据库模块
    PrismaModule,
    // 功能模块
    AuthModule,
    UsersModule,
    MarketingTasksModule,
    DashboardModule,
    AnalyticsModule,
  ],
  controllers: [HealthController, AppController],
  providers: [],
})
export class AppModule {}
