import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class GenerateImageDto {
  @ApiProperty({
    description: '图片生成提示',
    example: '现代风格的科技产品广告图片',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty({
    description: '生成选项',
    example: {
      n: 1,
      size: '1024x1024',
    },
    required: false,
  })
  @IsOptional()
  options?: any;
}