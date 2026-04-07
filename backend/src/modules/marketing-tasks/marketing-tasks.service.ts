import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MarketingTask, TaskStatus, TaskStage, StageStatus, Prisma } from '@prisma/client';
import { CreateMarketingTaskDto, UpdateMarketingTaskDto, QueryMarketingTaskDto } from './dto/create-marketing-task.dto';
import { CreateCreativeDto } from './dto/create-creative.dto';

@Injectable()
export class MarketingTasksService {
  constructor(private readonly prisma: PrismaService) {}

  // 获取任务列表
  async findAll(query: QueryMarketingTaskDto) {
    const { status, keyword } = query;
    
    // 确保 page 和 pageSize 是数字
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    
    const where: Prisma.MarketingTaskWhereInput = {};
    
    if (status) {
      where.status = status as TaskStatus;
    }
    
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }

    const [tasks, total] = await Promise.all([
      this.prisma.marketingTask.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              stages: true,
              creatives: true,
            },
          },
        },
      }),
      this.prisma.marketingTask.count({ where }),
    ]);

    return {
      data: tasks,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // 获取任务详情
  async findOne(id: string) {
    const task = await this.prisma.marketingTask.findUnique({
      where: { id },
      include: {
        stages: {
          orderBy: { createdAt: 'asc' },
        },
        creatives: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            stages: true,
            creatives: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('任务不存在');
    }

    return task;
  }

  // 创建任务
  async create(data: CreateMarketingTaskDto, userId: string) {
    const task = await this.prisma.marketingTask.create({
      data: {
        name: data.name,
        description: data.description,
        targetAudience: data.targetAudience,
        budget: data.budget,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        createdBy: userId,
        status: TaskStatus.draft,
      },
    });

    // 创建初始阶段输出
    await this.prisma.taskStageOutput.create({
      data: {
        taskId: task.id,
        stage: TaskStage.data_collection,
        output: {},
        status: StageStatus.pending,
      },
    });

    return task;
  }

  // 更新任务
  async update(id: string, data: UpdateMarketingTaskDto) {
    await this.findOne(id);

    return this.prisma.marketingTask.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        targetAudience: data.targetAudience,
        budget: data.budget,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  // 删除任务
  async remove(id: string) {
    await this.findOne(id);
    
    await this.prisma.marketingTask.delete({
      where: { id },
    });

    return { message: '任务已删除' };
  }

  // 获取任务阶段输出
  async getStages(taskId: string) {
    await this.findOne(taskId);

    return this.prisma.taskStageOutput.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // 获取创意列表
  async getCreatives(taskId: string) {
    await this.findOne(taskId);

    return this.prisma.adCreative.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 保存创意
  async createCreative(taskId: string, data: CreateCreativeDto) {
    await this.findOne(taskId);

    return this.prisma.adCreative.create({
      data: {
        taskId,
        type: data.type,
        title: data.title,
        content: data.content,
        aiGenerated: data.aiGenerated,
        aiModel: data.aiModel,
      },
    });
  }

  // 推进任务阶段
  async advanceStage(taskId: string, stageOutput?: any) {
    const task = await this.findOne(taskId);

    const stageOrder = [
      TaskStage.data_collection,
      TaskStage.market_analysis,
      TaskStage.strategy,
      TaskStage.planning,
      TaskStage.creative,
      TaskStage.execution,
      TaskStage.analysis,
      TaskStage.optimization,
    ];

    // 获取当前进行中的阶段
    const currentStageOutput = await this.prisma.taskStageOutput.findFirst({
      where: {
        taskId,
        status: { in: [StageStatus.pending, StageStatus.processing] },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 如果没有进行中的阶段，从第一个阶段开始
    const currentStage = currentStageOutput?.stage || TaskStage.data_collection;
    const currentStageIndex = stageOrder.findIndex(s => s === currentStage);
    const nextStage = stageOrder[currentStageIndex + 1];

    if (!nextStage) {
      // 更新任务为完成状态
      await this.prisma.marketingTask.update({
        where: { id: taskId },
        data: { status: TaskStatus.completed },
      });
      return { message: '已经是最后一个阶段，任务已完成' };
    }

    // 更新当前阶段状态为完成
    if (currentStageOutput) {
      await this.prisma.taskStageOutput.update({
        where: { id: currentStageOutput.id },
        data: {
          status: StageStatus.completed,
          output: stageOutput || {},
        },
      });
    }

    // 创建下一阶段
    await this.prisma.taskStageOutput.create({
      data: {
        taskId,
        stage: nextStage,
        output: {},
        status: StageStatus.pending,
      },
    });

    // 更新任务状态为进行中
    await this.prisma.marketingTask.update({
      where: { id: taskId },
      data: { status: TaskStatus.active },
    });

    return {
      message: '阶段推进成功',
      currentStage: nextStage,
    };
  }

  // 完成特定阶段并推进到下一阶段
  async completeStage(taskId: string, stageId: string, stageOutput?: any) {
    const task = await this.findOne(taskId);

    const stageOrder = [
      TaskStage.data_collection,
      TaskStage.market_analysis,
      TaskStage.strategy,
      TaskStage.planning,
      TaskStage.creative,
      TaskStage.execution,
      TaskStage.analysis,
      TaskStage.optimization,
    ];

    // 获取指定阶段
    const stageOutputRecord = await this.prisma.taskStageOutput.findUnique({
      where: { id: stageId },
    });

    if (!stageOutputRecord) {
      throw new Error('阶段不存在');
    }

    if (stageOutputRecord.taskId !== taskId) {
      throw new Error('阶段不属于该任务');
    }

    // 更新指定阶段为已完成
    await this.prisma.taskStageOutput.update({
      where: { id: stageId },
      data: {
        status: StageStatus.completed,
        output: stageOutput || { result: '已完成' },
      },
    });

    // 获取当前阶段的索引
    const currentStageIndex = stageOrder.findIndex(s => s === stageOutputRecord.stage);

    // 计算进度百分比
    const completedCount = await this.prisma.taskStageOutput.count({
      where: {
        taskId,
        status: StageStatus.completed,
      },
    });
    const progress = Math.round((completedCount / stageOrder.length) * 100);

    // 如果还有下一阶段，创建它
    if (currentStageIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentStageIndex + 1];

      await this.prisma.taskStageOutput.create({
        data: {
          taskId,
          stage: nextStage,
          output: {},
          status: StageStatus.processing,
        },
      });

      // 更新任务状态和进度
      await this.prisma.marketingTask.update({
        where: { id: taskId },
        data: {
          status: TaskStatus.active,
        },
      });

      return {
        message: '阶段已完成，自动进入下一阶段',
        currentStage: nextStage,
        progress,
      };
    } else {
      // 所有阶段完成
      await this.prisma.marketingTask.update({
        where: { id: taskId },
        data: {
          status: TaskStatus.completed,
        },
      });

      return {
        message: '所有阶段已完成，任务已完成',
        currentStage: null,
        progress: 100,
      };
    }
  }
}
