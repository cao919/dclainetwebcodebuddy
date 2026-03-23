import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ExecuteWorkflowDto {
  @ApiProperty({
    description: '任务ID',
    example: '12345678-1234-1234-1234-123456789012',
  })
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @ApiProperty({
    description: '工作流阶段',
    example: 'creative',
    enum: [
      'data_collection',
      'market_analysis',
      'strategy',
      'planning',
      'creative',
      'execution',
      'analysis',
      'optimization',
    ],
  })
  @IsString()
  @IsNotEmpty()
  stage: string;

  @ApiProperty({
    description: '输入数据',
    example: {
      product: { name: '测试产品' },
      targetMarket: '中国市场',
    },
  })
  @IsNotEmpty()
  inputData: any;

  @ApiProperty({
    description: '额外选项',
    required: false,
  })
  @IsOptional()
  options?: any;
}