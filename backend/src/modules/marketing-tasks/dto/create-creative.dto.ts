import { IsString, IsOptional, IsObject, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreativeType, CreativeStatus } from '@prisma/client';

export class CreateCreativeDto {
  @ApiProperty({ description: '创意类型', enum: CreativeType })
  @IsEnum(CreativeType)
  type: CreativeType;

  @ApiPropertyOptional({ description: '创意标题' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: '创意内容', type: Object })
  @IsObject()
  content: any;

  @ApiPropertyOptional({ description: '是否AI生成', default: true })
  @IsBoolean()
  @IsOptional()
  aiGenerated?: boolean = true;

  @ApiPropertyOptional({ description: 'AI模型' })
  @IsString()
  @IsOptional()
  aiModel?: string;
}

export class UpdateCreativeDto {
  @ApiPropertyOptional({ description: '创意标题' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: '创意内容', type: Object })
  @IsObject()
  @IsOptional()
  content?: any;

  @ApiPropertyOptional({ description: '创意状态', enum: CreativeStatus })
  @IsEnum(CreativeStatus)
  @IsOptional()
  status?: CreativeStatus;
}
