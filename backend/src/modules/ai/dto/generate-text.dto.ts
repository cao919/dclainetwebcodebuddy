import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class GenerateTextDto {
  @ApiProperty({
    description: '文本生成提示',
    example: '请为新产品生成营销文案',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty({
    description: '生成选项',
    example: {
      max_tokens: 1000,
      temperature: 0.7,
    },
    required: false,
  })
  @IsOptional()
  options?: any;
}