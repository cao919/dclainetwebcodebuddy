import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('效果分析')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get(':taskId/metrics')
  @ApiOperation({ summary: '获取任务核心指标' })
  @ApiParam({ name: 'taskId', description: '任务ID' })
  @ApiResponse({ status: 200, description: '成功获取核心指标' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  async getMetrics(@Param('taskId') taskId: string) {
    return this.analyticsService.getMetrics(taskId);
  }

  @Get(':taskId/channel-comparison')
  @ApiOperation({ summary: '获取渠道对比数据' })
  @ApiParam({ name: 'taskId', description: '任务ID' })
  @ApiResponse({ status: 200, description: '成功获取渠道对比数据' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  async getChannelComparison(@Param('taskId') taskId: string) {
    return this.analyticsService.getChannelComparison(taskId);
  }

  @Get(':taskId/recommendations')
  @ApiOperation({ summary: '获取优化建议' })
  @ApiParam({ name: 'taskId', description: '任务ID' })
  @ApiResponse({ status: 200, description: '成功获取优化建议' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  async getRecommendations(@Param('taskId') taskId: string) {
    return this.analyticsService.getRecommendations(taskId);
  }
}
