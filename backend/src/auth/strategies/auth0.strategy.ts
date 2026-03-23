import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class Auth0Strategy extends PassportStrategy(JwtStrategy, 'auth0') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: configService.get<string>('auth0.jwksUri'),
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: configService.get<string>('auth0.audience'),
      issuer: configService.get<string>('auth0.issuer'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    try {
      // 验证Auth0用户
      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException('无效的令牌载荷');
      }

      // 查找或创建本地用户
      let user = await this.usersService.findByAuth0Id(payload.sub);
      
      if (!user) {
        user = await this.usersService.create({
          auth0Id: payload.sub,
          email: payload.email,
          name: payload.name || payload.nickname || payload.email.split('@')[0],
          picture: payload.picture,
          role: 'user', // 默认角色
        });
      }

      // 更新最后登录时间
      await this.usersService.update(user.id, {
        lastLoginAt: new Date(),
      });

      // 返回用户信息
      return {
        id: user.id,
        auth0Id: user.auth0Id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture,
        auth0Payload: payload, // 包含原始Auth0载荷
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Auth0验证失败:', error);
      throw new UnauthorizedException('Auth0认证失败');
    }
  }
}