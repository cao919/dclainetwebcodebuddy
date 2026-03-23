import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AiService } from '../ai/ai.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);
  
  // 8阶段工作流定义
  private readonly stages = [
    { id: 'data_collection', name: '数据收集', order: 1 },
    { id: 'market_analysis', name: '市场分析', order: 2 },
    { id: 'strategy', name: '策略制定', order: 3 },
    { id: 'planning', name: '计划编排', order: 4 },
    { id: 'creative', name: '创意生成', order: 5 },
    { id: 'execution', name: '执行部署', order: 6 },
    { id: 'analysis', name: '效果分析', order: 7 },
    { id: 'optimization', name: '优化迭代', order: 8 },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * 获取所有工作流阶段
   */
  getStages() {
    return this.stages;
  }

  /**
   * 获取任务的工作流状态
   */
  async getTaskWorkflowStatus(taskId: string) {
    const task = await this.prisma.marketingTask.findUnique({
      where: { id: taskId },
      include: {
        stages: {
          orderBy: { stage: 'asc' },
        },
      },
    });

    if (!task) {
      throw new Error(`任务不存在: ${taskId}`);
    }

    // 构建阶段状态
    const stageStatus = this.stages.map(stage => {
      const existingStage = task.stages.find(s => s.stage === stage.id);
      
      return {
        ...stage,
        status: existingStage?.status || 'pending',
        output: existingStage?.output || null,
        createdAt: existingStage?.createdAt || null,
        updatedAt: existingStage?.updatedAt || null,
      };
    });

    // 计算总体进度
    const completedStages = stageStatus.filter(s => s.status === 'completed').length;
    const totalStages = this.stages.length;
    const progress = Math.round((completedStages / totalStages) * 100);

    return {
      taskId,
      taskName: task.name,
      taskStatus: task.status,
      overallProgress: progress,
      currentStage: this.getCurrentStage(stageStatus),
      nextStage: this.getNextStage(stageStatus),
      stages: stageStatus,
    };
  }

  /**
   * 执行特定阶段
   */
  async executeStage(taskId: string, stageId: string, inputData?: any) {
    // 验证任务存在
    const task = await this.prisma.marketingTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error(`任务不存在: ${taskId}`);
    }

    // 验证阶段有效
    const stage = this.stages.find(s => s.id === stageId);
    if (!stage) {
      throw new Error(`无效的阶段: ${stageId}`);
    }

    // 检查前置阶段是否完成
    if (!await this.checkPrerequisites(taskId, stageId)) {
      throw new Error(`前置阶段未完成，无法执行 ${stage.name}`);
    }

    // 更新阶段状态为处理中
    await this.updateStageStatus(taskId, stageId, 'processing');

    try {
      // 发出阶段开始事件
      this.eventEmitter.emit('workflow.stage.started', {
        taskId,
        stage: stageId,
        timestamp: new Date(),
      });

      // 调用AI服务执行阶段
      this.logger.log(`开始执行阶段: ${stage.name} (${stageId})`);
      
      const result = await this.aiService.executeMarketingWorkflow(
        taskId,
        stageId,
        inputData || {},
      );

      // 保存阶段输出
      await this.saveStageOutput(taskId, stageId, result);

      // 更新阶段状态为完成
      await this.updateStageStatus(taskId, stageId, 'completed', result);

      // 如果这是最后一个阶段，更新任务状态为完成
      if (stageId === 'optimization') {
        await this.prisma.marketingTask.update({
          where: { id: taskId },
          data: { status: 'completed' },
        });
      }

      // 发出阶段完成事件
      this.eventEmitter.emit('workflow.stage.completed', {
        taskId,
        stage: stageId,
        result,
        timestamp: new Date(),
      });

      this.logger.log(`阶段执行完成: ${stage.name} (${stageId})`);

      return {
        success: true,
        stage: stageId,
        result,
        message: `${stage.name} 执行成功`,
      };
    } catch (error) {
      this.logger.error(`阶段执行失败: ${stage.name} (${stageId})`, error);

      // 更新阶段状态为失败
      await this.updateStageStatus(taskId, stageId, 'failed', {
        error: error.message,
        timestamp: new Date(),
      });

      // 发出阶段失败事件
      this.eventEmitter.emit('workflow.stage.failed', {
        taskId,
        stage: stageId,
        error: error.message,
        timestamp: new Date(),
      });

      return {
        success: false,
        stage: stageId,
        error: error.message,
        message: `${stage.name} 执行失败`,
      };
    }
  }

  /**
   * 执行完整工作流
   */
  async executeCompleteWorkflow(taskId: string, initialInput?: any) {
    const task = await this.prisma.marketingTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error(`任务不存在: ${taskId}`);
    }

    // 更新任务状态为进行中
    await this.prisma.marketingTask.update({
      where: { id: taskId },
      data: { status: 'active' },
    });

    const results = [];
    let currentInput = initialInput || {};
    let hasError = false;

    // 按顺序执行所有阶段
    for (const stage of this.stages) {
      if (hasError) {
        // 如果有阶段失败，跳过后续阶段
        await this.updateStageStatus(taskId, stage.id, 'skipped');
        results.push({
          stage: stage.id,
          status: 'skipped',
          reason: '前置阶段失败',
        });
        continue;
      }

      // 检查前置条件
      if (!await this.checkPrerequisites(taskId, stage.id)) {
        this.logger.warn(`跳过阶段 ${stage.name}: 前置条件不满足`);
        await this.updateStageStatus(taskId, stage.id, 'skipped');
        results.push({
          stage: stage.id,
          status: 'skipped',
          reason: '前置条件不满足',
        });
        continue;
      }

      // 执行阶段
      const result = await this.executeStage(taskId, stage.id, currentInput);
      results.push(result);

      // 准备下一阶段的输入
      if (result.success && result.result?.output) {
        currentInput = {
          previousStage: stage.id,
          previousOutput: result.result.output,
          ...currentInput,
        };
      } else {
        hasError = true;
      }
    }

    // 如果所有阶段都成功完成，更新任务状态
    if (!hasError) {
      await this.prisma.marketingTask.update({
        where: { id: taskId },
        data: { status: 'completed' },
      });
    } else {
      await this.prisma.marketingTask.update({
        where: { id: taskId },
        data: { status: 'failed' },
      });
    }

    return {
      taskId,
      overallSuccess: !hasError,
      results,
      message: hasError ? '工作流执行过程中出现错误' : '完整工作流执行成功',
    };
  }

  /**
   * 手动推进到下一阶段
   */
  async advanceToNextStage(taskId: string) {
    const workflowStatus = await this.getTaskWorkflowStatus(taskId);
    const nextStage = workflowStatus.nextStage;

    if (!nextStage) {
      throw new Error('没有下一阶段可推进');
    }

    return this.executeStage(taskId, nextStage.id);
  }

  /**
   * 重试失败阶段
   */
  async retryFailedStage(taskId: string, stageId: string) {
    // 获取阶段当前状态
    const stageOutput = await this.prisma.taskStageOutput.findFirst({
      where: {
        taskId,
        stage: stageId as any,
      },
    });

    if (!stageOutput) {
      throw new Error(`阶段记录不存在: ${stageId}`);
    }

    if (stageOutput.status !== 'failed') {
      throw new Error(`只能重试失败阶段，当前状态: ${stageOutput.status}`);
    }

    // 使用之前的输入重试
    const previousInput = stageOutput.output as any;
    
    return this.executeStage(taskId, stageId, previousInput?.input || {});
  }

  /**
   * 跳过阶段
   */
  async skipStage(taskId: string, stageId: string, reason?: string) {
    const stage = this.stages.find(s => s.id === stageId);
    if (!stage) {
      throw new Error(`无效的阶段: ${stageId}`);
    }

    await this.updateStageStatus(taskId, stageId, 'skipped', {
      reason: reason || '手动跳过',
      skippedAt: new Date(),
    });

    return {
      success: true,
      stage: stageId,
      message: `${stage.name} 已跳过`,
    };
  }

  /**
   * 获取工作流统计
   */
  async getWorkflowStatistics() {
    const totalTasks = await this.prisma.marketingTask.count();
    
    const stageStats = await Promise.all(
      this.stages.map(async (stage) => {
        const count = await this.prisma.taskStageOutput.count({
          where: { stage: stage.id as any },
        });

        const statusCounts = await this.prisma.taskStageOutput.groupBy({
          by: ['status'],
          where: { stage: stage.id as any },
          _count: true,
        });

        return {
          stage: stage.id,
          name: stage.name,
          totalExecutions: count,
          statuses: statusCounts.map(sc => ({
            status: sc.status,
            count: sc._count,
          })),
        };
      })
    );

    return {
      totalTasks,
      stageStats,
      overallProgress: await this.calculateOverallProgress(),
    };
  }

  /**
   * 私有方法：检查前置条件
   */
  private async checkPrerequisites(taskId: string, stageId: string): Promise<boolean> {
    // 查找当前阶段的前置阶段
    const stage = this.stages.find(s => s.id === stageId);
    if (!stage) return false;

    // 第一个阶段没有前置条件
    if (stage.order === 1) return true;

    // 检查所有前置阶段是否完成
    const previousStages = this.stages.filter(s => s.order < stage.order);
    
    for (const prevStage of previousStages) {
      const stageOutput = await this.prisma.taskStageOutput.findFirst({
        where: {
          taskId,
          stage: prevStage.id as any,
        },
      });

      // 如果前置阶段不存在或未完成，返回false
      if (!stageOutput || stageOutput.status !== 'completed') {
        return false;
      }
    }

    return true;
  }

  /**
   * 私有方法：更新阶段状态
   */
  private async updateStageStatus(
    taskId: string,
    stageId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped',
    data?: any,
  ) {
    const existing = await this.prisma.taskStageOutput.findFirst({
      where: {
        taskId,
        stage: stageId as any,
      },
    });

    if (existing) {
      return this.prisma.taskStageOutput.update({
        where: { id: existing.id },
        data: {
          status,
          output: data ? { ...(existing.output as any), ...data } : existing.output,
          updatedAt: new Date(),
        },
      });
    } else {
      return this.prisma.taskStageOutput.create({
        data: {
          taskId,
          stage: stageId as any,
          status,
          output: data || {},
        },
      });
    }
  }

  /**
   * 私有方法：保存阶段输出
   */
  private async saveStageOutput(taskId: string, stageId: string, result: any) {
    const existing = await this.prisma.taskStageOutput.findFirst({
      where: {
        taskId,
        stage: stageId as any,
      },
    });

    if (existing) {
      await this.prisma.taskStageOutput.update({
        where: { id: existing.id },
        data: {
          output: { ...(existing.output as any), ...result },
          updatedAt: new Date(),
        },
      });
    } else {
      await this.prisma.taskStageOutput.create({
        data: {
          taskId,
          stage: stageId as any,
          status: 'completed',
          output: result,
        },
      });
    }
  }

  /**
   * 私有方法：获取当前阶段
   */
  private getCurrentStage(stageStatus: any[]): any {
    // 找到第一个未完成或正在处理的阶段
    const current = stageStatus.find(
      stage => stage.status === 'processing' || stage.status === 'pending'
    );

    // 如果没有处理中或等待中的阶段，返回最后一个完成阶段
    if (!current) {
      const completed = stageStatus
        .filter(stage => stage.status === 'completed')
        .sort((a, b) => b.order - a.order);

      return completed[0] || null;
    }

    return current;
  }

  /**
   * 私有方法：获取下一阶段
   */
  private getNextStage(stageStatus: any[]): any {
    const currentStage = this.getCurrentStage(stageStatus);
    
    if (!currentStage) {
      // 如果没有当前阶段，返回第一个阶段
      return this.stages[0];
    }

    if (currentStage.status === 'processing') {
      // 如果当前阶段正在处理，返回null
      return null;
    }

    // 找到下一个未开始的阶段
    const nextStage = this.stages.find(
      stage => stage.order > currentStage.order
    );

    return nextStage || null;
  }

  /**
   * 私有方法：计算总体进度
   */
  private async calculateOverallProgress(): Promise<number> {
    const allStages = await this.prisma.taskStageOutput.findMany();
    
    if (allStages.length === 0) return 0;

    const completed = allStages.filter(stage => stage.status === 'completed').length;
    const total = allStages.length;

    return Math.round((completed / total) * 100);
  }
}