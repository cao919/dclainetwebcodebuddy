import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { GenerateTextDto } from './dto/generate-text.dto';
import { GenerateImageDto } from './dto/generate-image.dto';
import { GenerateMarketingCopyDto } from './dto/generate-marketing-copy.dto';
import { ExecuteWorkflowDto } from './dto/execute-workflow.dto';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate/text')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '生成文本内容' })
  @ApiBody({ type: GenerateTextDto })
  @ApiResponse({
    status: 200,
    description: '文本生成成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  async generateText(@Body() generateTextDto: GenerateTextDto) {
    try {
      const result = await this.aiService.generateText(
        generateTextDto.prompt,
        generateTextDto.options,
      );

      return {
        success: true,
        data: result,
        message: '文本生成成功',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }

  @Post('generate/image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '生成图片' })
  @ApiBody({ type: GenerateImageDto })
  @ApiResponse({
    status: 200,
    description: '图片生成成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  async generateImage(@Body() generateImageDto: GenerateImageDto) {
    try {
      const result = await this.aiService.generateImage(
        generateImageDto.prompt,
        generateImageDto.options,
      );

      return {
        success: true,
        data: result,
        message: '图片生成成功',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }

  @Post('generate/marketing-copy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '生成营销文案' })
  @ApiBody({ type: GenerateMarketingCopyDto })
  @ApiResponse({
    status: 200,
    description: '营销文案生成成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  async generateMarketingCopy(@Body() generateMarketingCopyDto: GenerateMarketingCopyDto) {
    try {
      const result = await this.aiService.generateMarketingCopy(
        generateMarketingCopyDto.productInfo,
        generateMarketingCopyDto.targetAudience,
      );

      return {
        success: true,
        data: result,
        message: '营销文案生成成功',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }

  @Post('generate/ad-creative')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '生成广告创意图片' })
  @ApiQuery({ name: 'productName', required: true, type: String })
  @ApiQuery({ name: 'style', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: '广告创意图片生成成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  async generateAdCreative(
    @Query('productName') productName: string,
    @Query('style') style?: string,
  ) {
    try {
      const result = await this.aiService.generateAdCreativeImage(productName, style);

      return {
        success: true,
        data: result,
        message: '广告创意图片生成成功',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }

  @Post('analyze/optimize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '分析营销数据并提供优化建议' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({
    status: 200,
    description: '分析优化完成',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  async analyzeAndOptimize(@Body() performanceData: any) {
    try {
      const result = await this.aiService.analyzeAndOptimize(performanceData);

      return {
        success: true,
        data: result,
        message: '分析优化完成',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }

  @Post('workflow/execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '执行营销工作流阶段' })
  @ApiBody({ type: ExecuteWorkflowDto })
  @ApiResponse({
    status: 200,
    description: '工作流执行成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  async executeWorkflow(@Body() executeWorkflowDto: ExecuteWorkflowDto) {
    try {
      const result = await this.aiService.executeMarketingWorkflow(
        executeWorkflowDto.taskId,
        executeWorkflowDto.stage,
        executeWorkflowDto.inputData,
      );

      return {
        success: true,
        data: result,
        message: '工作流执行成功',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }

  @Post('workflow/execute-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '执行完整营销工作流' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({
    status: 200,
    description: '完整工作流执行成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'array' },
        message: { type: 'string' },
      },
    },
  })
  async executeCompleteWorkflow(@Body() workflowData: any) {
    try {
      const stages = [
        'data_collection',
        'market_analysis',
        'strategy',
        'planning',
        'creative',
        'execution',
        'analysis',
        'optimization',
      ];

      const results = [];
      let currentInput = workflowData.initialInput;

      for (const stage of stages) {
        const result = await this.aiService.executeMarketingWorkflow(
          workflowData.taskId,
          stage,
          currentInput,
        );

        results.push(result);
        
        // 下一阶段的输入是当前阶段的输出
        currentInput = {
          previousStage: stage,
          previousOutput: result.output,
          ...workflowData,
        };
      }

      return {
        success: true,
        data: results,
        message: '完整工作流执行成功',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取AI服务状态' })
  @ApiResponse({
    status: 200,
    description: '服务状态获取成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  async getStatus() {
    try {
      const status = await this.aiService.getServiceStatus();

      return {
        success: true,
        data: status,
        message: '服务状态获取成功',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }

  @Post('test/connection')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '测试AI服务连接' })
  @ApiResponse({
    status: 200,
    description: '连接测试完成',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' },
        message: { type: 'string' },
      },
    },
  })
  async testConnection() {
    try {
      // 发送一个简单的测试请求
      const testResult = await this.aiService.generateText('你好，请回复"连接成功"', {
        max_tokens: 10,
      });

      const responseText = testResult.choices?.[0]?.message?.content || '';

      return {
        success: true,
        data: {
          testResult,
          connection: 'success',
          response: responseText.includes('连接成功') ? '验证通过' : '响应异常',
        },
        message: 'AI服务连接测试完成',
      };
    } catch (error) {
      return {
        success: false,
        data: {
          connection: 'failed',
          error: error.message,
        },
        message: 'AI服务连接失败',
      };
    }
  }
}