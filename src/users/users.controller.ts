import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schema/users.schema';
import { JwtAuthGuard } from '../auth/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeUserPasswordDto } from './dto/change-user-password.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const res = await this.userService.createUser(createUserDto);
    return res
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<{ status: number; users: User[] }> {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<{ status: number; user: Partial<UserDocument> }> {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateOne(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<{ status: number; message: string }> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Patch(':id/change-password')
  @UseGuards(JwtAuthGuard)
  async changePass(@Param('id') id: string, @Body() changeUserPasswordDto: ChangeUserPasswordDto): Promise<{ status: number; message: string }> {
    return this.userService.changeUserPassword(id, changeUserPasswordDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string): Promise<{ status: number; message: string }> {
    return this.userService.delete(id);
  }
}
