import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TaskStatus, CreativeStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // 获取核心指标
  async getMetrics() {
    const [
      totalTasks,
      activeTasks,
      completedTasks,
      totalCreatives,
      publishedCreatives,
    ] = await Promise.all([
      this.prisma.marketingTask.count(),
      this.prisma.marketingTask.count({
        where: { status: TaskStatus.active },
      }),
      this.prisma.marketingTask.count({
        where: { status: TaskStatus.completed },
      }),
      this.prisma.adCreative.count(),
      this.prisma.adCreative.count({
        where: { status: CreativeStatus.published },
      }),
    ]);

    // 计算完成率
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    return {
      totalTasks,
      activeTasks,
      completedTasks,
      completionRate,
      totalCreatives,
      publishedCreatives,
    };
  }

  // 获取趋势数据
  async getTrend(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 获取每日任务创建数
    const tasksByDay = await this.prisma.marketingTask.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // 生成日期范围
    const dates: string[] = [];
    const taskCounts: number[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);
      
      const count = tasksByDay.filter(t => 
        t.createdAt.toISOString().startsWith(dateStr)
      ).reduce((sum, t) => sum + t._count.id, 0);
      
      taskCounts.push(count);
    }

    return {
      dates,
      taskCounts,
    };
  }

  // 获取最近任务
  async getRecentTasks(limit: number = 5) {
    return this.prisma.marketingTask.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            stages: true,
            creatives: true,
          },
        },
      },
    });
  }
}
