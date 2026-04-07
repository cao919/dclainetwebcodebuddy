import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MarketingTasksService } from './marketing-tasks.service';
import { CreateMarketingTaskDto, UpdateMarketingTaskDto, QueryMarketingTaskDto } from './dto/create-marketing-task.dto';
import { CreateCreativeDto } from './dto/create-creative.dto';

@ApiTags('营销任务')
@Controller('marketing-tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class MarketingTasksController {
  constructor(private readonly marketingTasksService: MarketingTasksService) {}

  @Get()
  @ApiOperation({ summary: '获取任务列表' })
  @ApiResponse({ status: 200, description: '成功获取任务列表' })
  async findAll(@Query() query: QueryMarketingTaskDto) {
    return this.marketingTasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取任务详情' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '成功获取任务详情' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  async findOne(@Param('id') id: string) {
    return this.marketingTasksService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建营销任务' })
  @ApiResponse({ status: 201, description: '任务创建成功' })
  async create(
    @Body() data: CreateMarketingTaskDto,
    @Request() req: ExpressRequest,
  ) {
    const userId = (req as any).user.id;
    return this.marketingTasksService.create(data, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新任务' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '任务更新成功' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  async update(@Param('id') id: string, @Body() data: UpdateMarketingTaskDto) {
    return this.marketingTasksService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除任务' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '任务删除成功' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  async remove(@Param('id') id: string) {
    return this.marketingTasksService.remove(id);
  }

  @Get(':id/stages')
  @ApiOperation({ summary: '获取任务阶段输出' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '成功获取阶段输出' })
  async getStages(@Param('id') id: string) {
    return this.marketingTasksService.getStages(id);
  }

  @Get(':id/creatives')
  @ApiOperation({ summary: '获取任务创意列表' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '成功获取创意列表' })
  async getCreatives(@Param('id') id: string) {
    return this.marketingTasksService.getCreatives(id);
  }

  @Post(':id/creatives')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '保存创意' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 201, description: '创意保存成功' })
  async createCreative(
    @Param('id') id: string,
    @Body() data: CreateCreativeDto,
  ) {
    return this.marketingTasksService.createCreative(id, data);
  }

  @Post(':id/advance-stage')
  @ApiOperation({ summary: '推进任务阶段' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '阶段推进成功' })
  async advanceStage(
    @Param('id') id: string,
    @Body() body?: { output?: any },
  ) {
    return this.marketingTasksService.advanceStage(id, body?.output);
  }

  @Post(':id/complete-stage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '完成特定阶段并推进到下一阶段' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '阶段完成成功' })
  async completeStage(
    @Param('id') id: string,
    @Body() body: { stageId: string; output?: any },
  ) {
    return this.marketingTasksService.completeStage(id, body.stageId, body.output);
  }
}
