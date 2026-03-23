import { ApiProperty } from '@nestjs/swagger';

export class Auth0CallbackDto {
  @ApiProperty({
    description: 'Auth0用户信息',
    example: {
      sub: 'auth0|1234567890',
      email: 'user@example.com',
      name: 'John Doe',
      picture: 'https://example.com/avatar.jpg',
    },
  })
  auth0User: any;
}