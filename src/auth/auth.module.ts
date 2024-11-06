import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => FriendsModule),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET_KEY || 'SECRET'
    })
  ],
  exports: [
    AuthService,
    JwtModule
  ]
})
export class AuthModule {}
