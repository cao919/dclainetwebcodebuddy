import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly textModel: string;
  private readonly imageModel: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('zhipuAi.apiKey');
    this.baseUrl = this.configService.get<string>('zhipuAi.baseUrl');
    this.textModel = this.configService.get<string>('zhipuAi.textModel', 'glm-4');
    this.imageModel = this.configService.get<string>('zhipuAi.imageModel', 'cogview-3');
  }

  /**
   * 生成文本内容
   */
  async generateText(prompt: string, options?: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.textModel,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: this.configService.get<number>('zhipuAi.maxTokens', 4096),
          temperature: this.configService.get<number>('zhipuAi.temperature', 0.7),
          ...options,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.configService.get<number>('zhipuAi.timeout', 30000),
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('智谱AI文本生成失败:', error);
      throw new Error(`AI文本生成失败: ${error.message}`);
    }
  }

  /**
   * 生成图片
   */
  async generateImage(prompt: string, options?: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/images/generations`,
        {
          model: this.imageModel,
          prompt: prompt,
          n: options?.n || 1,
          size: options?.size || '1024x1024',
          response_format: options?.response_format || 'url',
          ...options,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: this.configService.get<number>('zhipuAi.timeout', 30000),
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('智谱AI图片生成失败:', error);
      throw new Error(`AI图片生成失败: ${error.message}`);
    }
  }

  /**
   * 生成营销文案
   */
  async generateMarketingCopy(productInfo: any, targetAudience: string): Promise<any> {
    const prompt = `
请为以下产品生成营销文案：

产品信息：
- 产品名称：${productInfo.name}
- 产品描述：${productInfo.description}
- 主要特点：${productInfo.features?.join(', ') || '无'}
- 目标价格：${productInfo.price || '未指定'}

目标受众：${targetAudience}

请生成以下类型的文案：
1. 产品标语（不超过10个字）
2. 产品描述（100-150字）
3. 社交媒体帖子（适合微博/微信朋友圈）
4. 广告标题（3个不同版本）
5. 行动号召（CTA）

请以JSON格式返回，包含以上5个字段。
`;

    try {
      const response = await this.generateText(prompt);
      const content = response.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('AI返回内容为空');
      }

      // 尝试解析JSON
      try {
        return JSON.parse(content);
      } catch {
        // 如果不是JSON，返回原始内容
        return {
          slogan: content.substring(0, 50),
          description: content,
          socialMediaPost: content.substring(0, 200),
          adTitles: [
            content.substring(0, 30),
            content.substring(30, 60),
            content.substring(60, 90),
          ],
          callToAction: '立即购买',
        };
      }
    } catch (error) {
      this.logger.error('生成营销文案失败:', error);
      throw error;
    }
  }

  /**
   * 生成广告创意图片
   */
  async generateAdCreativeImage(
    productName: string,
    style: string = '现代、专业',
  ): Promise<any> {
    const prompt = `为产品"${productName}"生成广告创意图片，风格：${style}。图片应包含产品元素和吸引人的设计。`;

    try {
      const response = await this.generateImage(prompt, {
        n: 1,
        size: '1024x1024',
      });

      return response.data?.[0] || response;
    } catch (error) {
      this.logger.error('生成广告创意图片失败:', error);
      throw error;
    }
  }

  /**
   * 分析营销数据并提供优化建议
   */
  async analyzeAndOptimize(performanceData: any): Promise<any> {
    const prompt = `
请分析以下营销数据并提供优化建议：

营销数据：
${JSON.stringify(performanceData, null, 2)}

请分析：
1. 整体表现评估
2. 关键指标分析（CTR、转化率、ROI等）
3. 存在的问题和机会
4. 具体的优化建议（至少5条）
5. 下一步行动计划

请以JSON格式返回分析结果。
`;

    try {
      const response = await this.generateText(prompt);
      const content = response.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('AI返回内容为空');
      }

      try {
        return JSON.parse(content);
      } catch {
        return {
          assessment: '数据分析完成',
          analysis: content.substring(0, 500),
          recommendations: [
            '优化广告文案',
            '调整目标受众',
            '改进落地页',
            '增加预算',
            '测试新创意',
          ],
          actionPlan: '根据建议执行优化措施',
        };
      }
    } catch (error) {
      this.logger.error('分析营销数据失败:', error);
      throw error;
    }
  }

  /**
   * 执行完整的营销工作流
   */
  async executeMarketingWorkflow(taskId: string, stage: string, inputData: any): Promise<any> {
    this.logger.log(`执行营销工作流阶段: ${stage}, 任务ID: ${taskId}`);

    switch (stage) {
      case 'data_collection':
        return await this.executeDataCollection(inputData);
      
      case 'market_analysis':
        return await this.executeMarketAnalysis(inputData);
      
      case 'strategy':
        return await this.executeStrategyDevelopment(inputData);
      
      case 'planning':
        return await this.executeCampaignPlanning(inputData);
      
      case 'creative':
        return await this.executeCreativeGeneration(inputData);
      
      case 'execution':
        return await this.executeCampaignExecution(inputData);
      
      case 'analysis':
        return await this.executePerformanceAnalysis(inputData);
      
      case 'optimization':
        return await this.executeOptimization(inputData);
      
      default:
        throw new Error(`未知的工作流阶段: ${stage}`);
    }
  }

  /**
   * 执行数据收集阶段
   */
  private async executeDataCollection(inputData: any): Promise<any> {
    const prompt = `
作为营销AI助手，请收集和分析以下产品的市场数据：

产品信息：
${JSON.stringify(inputData.product, null, 2)}

目标市场：${inputData.targetMarket || '未指定'}

请提供：
1. 市场规模和趋势
2. 竞争对手分析
3. 目标客户画像
4. 市场机会识别
5. 数据收集建议

请以结构化的JSON格式返回。
`;

    const response = await this.generateText(prompt);
    return {
      stage: 'data_collection',
      output: response.choices?.[0]?.message?.content,
      summary: '市场数据收集完成',
    };
  }

  /**
   * 执行市场分析阶段
   */
  private async executeMarketAnalysis(inputData: any): Promise<any> {
    const prompt = `
基于以下市场数据，进行深度分析：

市场数据：
${JSON.stringify(inputData.marketData, null, 2)}

请进行：
1. SWOT分析（优势、劣势、机会、威胁）
2. PEST分析（政治、经济、社会、技术）
3. 竞争格局分析
4. 市场细分建议
5. 关键成功因素

请以结构化的JSON格式返回。
`;

    const response = await this.generateText(prompt);
    return {
      stage: 'market_analysis',
      output: response.choices?.[0]?.message?.content,
      summary: '市场分析完成',
    };
  }

  /**
   * 执行策略制定阶段
   */
  private async executeStrategyDevelopment(inputData: any): Promise<any> {
    const prompt = `
基于市场分析结果，制定营销策略：

市场分析：
${JSON.stringify(inputData.analysis, null, 2)}

请制定：
1. 营销目标（SMART原则）
2. 目标市场选择
3. 市场定位策略
4. 营销组合（4P）
5. 预算分配建议
6. 时间规划

请以结构化的JSON格式返回。
`;

    const response = await this.generateText(prompt);
    return {
      stage: 'strategy',
      output: response.choices?.[0]?.message?.content,
      summary: '营销策略制定完成',
    };
  }

  /**
   * 执行计划编排阶段
   */
  private async executeCampaignPlanning(inputData: any): Promise<any> {
    const prompt = `
基于营销策略，制定详细的执行计划：

营销策略：
${JSON.stringify(inputData.strategy, null, 2)}

请制定：
1. 详细的活动时间表
2. 渠道选择和执行计划
3. 内容日历
4. 资源需求清单
5. 风险管理和应急预案
6. KPI指标和监控计划

请以结构化的JSON格式返回。
`;

    const response = await this.generateText(prompt);
    return {
      stage: 'planning',
      output: response.choices?.[0]?.message?.content,
      summary: '营销计划编排完成',
    };
  }

  /**
   * 执行创意生成阶段
   */
  private async executeCreativeGeneration(inputData: any): Promise<any> {
    const prompt = `
基于营销计划，生成创意内容：

营销计划：
${JSON.stringify(inputData.plan, null, 2)}

目标受众：${inputData.targetAudience || '未指定'}

请生成：
1. 广告文案（多个版本）
2. 视觉设计概念
3. 多媒体内容建议
4. 品牌信息框架
5. 创意执行指南

请以结构化的JSON格式返回。
`;

    const response = await this.generateText(prompt);
    
    // 同时生成示例图片
    let imageResult = null;
    try {
      imageResult = await this.generateAdCreativeImage(
        inputData.plan?.productName || '营销产品',
        inputData.plan?.style || '现代专业',
      );
    } catch (imageError) {
      this.logger.warn('创意图片生成失败:', imageError);
    }

    return {
      stage: 'creative',
      output: response.choices?.[0]?.message?.content,
      images: imageResult,
      summary: '创意内容生成完成',
    };
  }

  /**
   * 执行执行部署阶段
   */
  private async executeCampaignExecution(inputData: any): Promise<any> {
    const prompt = `
执行营销活动部署：

创意内容：
${JSON.stringify(inputData.creatives, null, 2)}

请提供：
1. 部署检查清单
2. 渠道发布指南
3. 监控设置建议
4. 团队协作计划
5. 沟通协调机制
6. 应急处理流程

请以结构化的JSON格式返回。
`;

    const response = await this.generateText(prompt);
    return {
      stage: 'execution',
      output: response.choices?.[0]?.message?.content,
      summary: '营销活动部署完成',
    };
  }

  /**
   * 执行效果分析阶段
   */
  private async executePerformanceAnalysis(inputData: any): Promise<any> {
    const prompt = `
分析营销活动效果：

活动数据：
${JSON.stringify(inputData.performanceData, null, 2)}

请分析：
1. 整体效果评估
2. 关键指标达成情况
3. 渠道效果对比
4. 创意表现分析
5. 投资回报率计算
6. 成功因素和教训

请以结构化的JSON格式返回。
`;

    const response = await this.generateText(prompt);
    return {
      stage: 'analysis',
      output: response.choices?.[0]?.message?.content,
      summary: '营销效果分析完成',
    };
  }

  /**
   * 执行优化迭代阶段
   */
  private async executeOptimization(inputData: any): Promise<any> {
    const prompt = `
基于效果分析，提供优化建议：

效果分析：
${JSON.stringify(inputData.analysis, null, 2)}

请提供：
1. 优化机会识别
2. 具体的优化措施
3. A/B测试建议
4. 预算重新分配建议
5. 下一阶段规划
6. 长期优化路线图

请以结构化的JSON格式返回。
`;

    const response = await this.generateText(prompt);
    return {
      stage: 'optimization',
      output: response.choices?.[0]?.message?.content,
      summary: '营销优化建议生成完成',
    };
  }

  /**
   * 获取AI服务状态
   */
  async getServiceStatus(): Promise<any> {
    try {
      // 尝试调用一个简单的API来检查服务状态
      await this.generateText('你好', { max_tokens: 10 });
      
      return {
        status: 'active',
        message: '智谱AI服务运行正常',
        models: {
          text: this.textModel,
          image: this.imageModel,
        },
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'inactive',
        message: `智谱AI服务异常: ${error.message}`,
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }
}