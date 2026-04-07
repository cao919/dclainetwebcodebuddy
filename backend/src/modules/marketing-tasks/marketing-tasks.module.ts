import { Module } from '@nestjs/common';
import { MarketingTasksController } from './marketing-tasks.controller';
import { MarketingTasksService } from './marketing-tasks.service';

@Module({
  controllers: [MarketingTasksController],
  providers: [MarketingTasksService],
  exports: [MarketingTasksService],
})
export class MarketingTasksModule {}
