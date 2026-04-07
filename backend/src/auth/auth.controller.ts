import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Auth0AuthGuard } from './guards/auth0-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Auth0CallbackDto } from './dto/auth0-callback.dto';
import { UsersService } from '../modules/users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
            picture: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '认证失败' })
  async login(@Body() loginDto: LoginDto) {
    // 开发测试模式：允许任意邮箱密码登录
    // 实际项目中应该验证用户名密码
    
    // 查找或创建用户
    let user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      // 创建测试用户
      user = await this.usersService.create({
        email: loginDto.email,
        name: loginDto.email.split('@')[0],
        role: 'user',
        auth0Id: `local_${Date.now()}`,
      });
    }
    
    // 生成JWT令牌
    const tokens = await this.authService.generateToken(user);
    
    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture,
      },
    };
  }

  @Post('auth0/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Auth0登录回调' })
  @ApiBody({ type: Auth0CallbackDto })
  @ApiResponse({
    status: 200,
    description: 'Auth0登录成功',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
            picture: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Auth0认证失败' })
  async auth0Callback(@Body() auth0CallbackDto: Auth0CallbackDto) {
    return this.authService.handleAuth0Callback(auth0CallbackDto.auth0User);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: '刷新成功',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '无效的刷新令牌' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);
    return {
      access_token: result.accessToken,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户信息' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
        picture: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async getProfile(@Request() req: ExpressRequest) {
    const userId = (req as any).user?.sub;
    return this.authService.getUserProfile(userId);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登出' })
  @ApiResponse({ status: 200, description: '登出成功' })
  async logout(@Request() req: ExpressRequest) {
    // 这里可以实现令牌黑名单等逻辑
    return { message: '登出成功' };
  }
}
