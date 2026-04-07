import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // 验证任务是否存在
  private async validateTask(taskId: string) {
    const task = await this.prisma.marketingTask.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException('任务不存在');
    }
    return task;
  }

  // 获取核心指标
  async getMetrics(taskId: string) {
    await this.validateTask(taskId);

    const performances = await this.prisma.marketingPerformance.findMany({
      where: {
        creative: {
          taskId,
        },
      },
    });

    // 聚合指标
    const totals = performances.reduce(
      (acc, p) => {
        const metrics = p.metrics as any;
        return {
          impressions: acc.impressions + (metrics?.impressions || 0),
          clicks: acc.clicks + (metrics?.clicks || 0),
          conversions: acc.conversions + (metrics?.conversions || 0),
          spend: acc.spend + (metrics?.spend || 0),
        };
      },
      { impressions: 0, clicks: 0, conversions: 0, spend: 0 },
    );

    // 计算比率
    const ctr = totals.impressions > 0 
      ? (totals.clicks / totals.impressions) * 100 
      : 0;
    
    const conversionRate = totals.clicks > 0 
      ? (totals.conversions / totals.clicks) * 100 
      : 0;
    
    const cpa = totals.conversions > 0 
      ? totals.spend / totals.conversions 
      : 0;

    return {
      ...totals,
      ctr: parseFloat(ctr.toFixed(2)),
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      cpa: parseFloat(cpa.toFixed(2)),
    };
  }

  // 获取渠道对比
  async getChannelComparison(taskId: string) {
    await this.validateTask(taskId);

    const performances = await this.prisma.marketingPerformance.findMany({
      where: {
        creative: {
          taskId,
        },
      },
      include: {
        creative: true,
      },
    });

    // 按渠道分组统计
    const channelMap = new Map<string, any>();

    performances.forEach(p => {
      const source = p.source || 'unknown';
      const metrics = p.metrics as any;

      if (!channelMap.has(source)) {
        channelMap.set(source, {
          source,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0,
        });
      }

      const channel = channelMap.get(source);
      channel.impressions += metrics?.impressions || 0;
      channel.clicks += metrics?.clicks || 0;
      channel.conversions += metrics?.conversions || 0;
      channel.spend += metrics?.spend || 0;
    });

    // 计算各渠道的比率
    const channels = Array.from(channelMap.values()).map(channel => {
      const ctr = channel.impressions > 0 
        ? (channel.clicks / channel.impressions) * 100 
        : 0;
      const conversionRate = channel.clicks > 0 
        ? (channel.conversions / channel.clicks) * 100 
        : 0;
      const cpa = channel.conversions > 0 
        ? channel.spend / channel.conversions 
        : 0;

      return {
        ...channel,
        ctr: parseFloat(ctr.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        cpa: parseFloat(cpa.toFixed(2)),
      };
    });

    return channels;
  }

  // 获取优化建议
  async getRecommendations(taskId: string) {
    await this.validateTask(taskId);

    const metrics = await this.getMetrics(taskId);
    const channels = await this.getChannelComparison(taskId);

    const recommendations: string[] = [];

    // 基于 CTR 的建议
    if (metrics.ctr < 1) {
      recommendations.push('点击率较低，建议优化创意素材和标题，提高吸引力');
    } else if (metrics.ctr > 3) {
      recommendations.push('点击率表现优秀，可以加大投放预算扩大效果');
    }

    // 基于转化率的建议
    if (metrics.conversionRate < 2) {
      recommendations.push('转化率偏低，建议优化落地页体验或调整受众定向');
    }

    // 基于渠道的建议
    const bestChannel = channels.reduce((best, current) => 
      current.roi > best.roi ? current : best, channels[0]);
    
    if (bestChannel && bestChannel.roi > 0) {
      recommendations.push(`"${bestChannel.source}"渠道ROI表现最佳，建议增加该渠道预算分配`);
    }

    // 基于花费的建议
    if (metrics.spend > 10000 && metrics.conversions < 10) {
      recommendations.push('花费较高但转化不足，建议暂停效果差的广告组，重新评估投放策略');
    }

    // 通用建议
    if (recommendations.length === 0) {
      recommendations.push('整体表现平稳，建议持续监控数据变化，适时调整出价策略');
    }

    return {
      recommendations,
      priority: metrics.conversionRate < 1 ? 'high' : metrics.conversionRate < 2 ? 'medium' : 'low',
    };
  }
}
