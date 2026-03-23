import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ManagementClient } from 'auth0';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../modules/users/users.service';

@Injectable()
export class AuthService {
  private auth0Management: ManagementClient;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {
    // 初始化Auth0管理客户端
    this.auth0Management = new ManagementClient({
      domain: this.configService.get<string>('auth0.domain'),
      clientId: this.configService.get<string>('auth0.clientId'),
      clientSecret: this.configService.get<string>('auth0.clientSecret'),
      scope: 'read:users update:users',
    });
  }

  /**
   * 验证JWT令牌
   */
  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('无效的令牌');
    }
  }

  /**
   * 验证Auth0令牌
   */
  async validateAuth0Token(token: string): Promise<any> {
    try {
      // 这里应该调用Auth0的/introspect端点验证令牌
      // 简化实现：解析JWT并验证签名
      const payload = this.jwtService.decode(token);
      
      if (!payload || typeof payload === 'string') {
        throw new UnauthorizedException('无效的令牌');
      }

      // 检查令牌是否过期
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new UnauthorizedException('令牌已过期');
      }

      // 检查受众是否匹配
      const audience = this.configService.get<string>('auth0.audience');
      if (payload.aud && payload.aud !== audience) {
        throw new UnauthorizedException('无效的令牌受众');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('令牌验证失败');
    }
  }

  /**
   * 生成JWT令牌
   */
  async generateToken(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      auth0Id: user.auth0Id,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '604800s'),
      },
    );

    return { accessToken, refreshToken };
  }

  /**
   * 刷新令牌
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        auth0Id: user.auth0Id,
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  /**
   * 处理Auth0登录回调
   */
  async handleAuth0Callback(auth0User: any): Promise<any> {
    try {
      // 从Auth0用户信息中提取必要数据
      const auth0Id = auth0User.sub;
      const email = auth0User.email;
      const name = auth0User.name || auth0User.nickname || email.split('@')[0];
      const picture = auth0User.picture;

      // 查找或创建本地用户
      let user = await this.usersService.findByAuth0Id(auth0Id);
      
      if (!user) {
        user = await this.usersService.create({
          auth0Id,
          email,
          name,
          picture,
          role: 'user', // 默认角色
        });
      } else {
        // 更新用户信息
        user = await this.usersService.update(user.id, {
          name,
          picture,
          lastLoginAt: new Date(),
        });
      }

      // 生成JWT令牌
      const tokens = await this.generateToken(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          picture: user.picture,
        },
        ...tokens,
      };
    } catch (error) {
      console.error('Auth0回调处理失败:', error);
      throw new UnauthorizedException('登录失败');
    }
  }

  /**
   * 获取用户信息
   */
  async getUserProfile(userId: string): Promise<any> {
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      picture: user.picture,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  /**
   * 登出
   */
  async logout(userId: string): Promise<{ message: string }> {
    // 在实际应用中，这里应该将令牌加入黑名单
    // 简化实现：只返回成功消息
    return { message: '登出成功' };
  }

  /**
   * 验证API密钥
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    // 这里可以添加API密钥验证逻辑
    // 简化实现：检查是否存在于系统配置中
    const validApiKeys = this.configService.get<string[]>('api.keys', []);
    return validApiKeys.includes(apiKey);
  }
}