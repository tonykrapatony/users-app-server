import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('/login')
  login(@Body() userDto: CreateUserDto) {
    return this.authService.login(userDto)
  }
  @Post('/registration')
  registration(@Body() userDto: CreateUserDto) {
    return this.authService.registration(userDto)
  }
  @Post('/forgot')
  forgot(@Body() userDto: CreateUserDto) {
    return this.authService.forgot(userDto)
  }
  @Post('/refresh')
  refreshToken(@Body() body: { refreshToken: string }) {
    const { refreshToken } = body
    return this.authService.refreshToken(refreshToken)
  }

}
