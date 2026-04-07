import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('仪表盘')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @ApiOperation({ summary: '获取核心指标' })
  @ApiResponse({ status: 200, description: '成功获取核心指标' })
  async getMetrics() {
    return this.dashboardService.getMetrics();
  }

  @Get('trend')
  @ApiOperation({ summary: '获取趋势数据' })
  @ApiQuery({ name: 'days', required: false, description: '天数', type: Number })
  @ApiResponse({ status: 200, description: '成功获取趋势数据' })
  async getTrend(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.dashboardService.getTrend(daysNum);
  }

  @Get('recent-tasks')
  @ApiOperation({ summary: '获取最近任务' })
  @ApiQuery({ name: 'limit', required: false, description: '数量限制', type: Number })
  @ApiResponse({ status: 200, description: '成功获取最近任务' })
  async getRecentTasks(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.dashboardService.getRecentTasks(limitNum);
  }
}
