import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class GenerateMarketingCopyDto {
  @ApiProperty({
    description: '产品信息',
    example: {
      name: '智能手表',
      description: '多功能健康监测智能手表',
      features: ['心率监测', '睡眠跟踪', 'GPS定位', '防水'],
      price: '¥1999',
    },
  })
  @IsNotEmpty()
  productInfo: any;

  @ApiProperty({
    description: '目标受众',
    example: '25-40岁的健康意识强的都市白领',
  })
  @IsString()
  @IsNotEmpty()
  targetAudience: string;

  @ApiProperty({
    description: '额外选项',
    required: false,
  })
  @IsOptional()
  options?: any;
}