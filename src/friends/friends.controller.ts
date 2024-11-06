import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('/creatre')
  async create(@Body() createItemDto: CreateItemDto) {
    const res = await this.friendsService.createItem(createItemDto);
    return res
  }

  @Post('request')
  @UseGuards(JwtAuthGuard)
  async request(@Body() createRequestDto: CreateRequestDto) {
    const res = await this.friendsService.sendFriendRequest(createRequestDto);
    return res
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getFriends(@Param('id') id: string) {
    const res = await this.friendsService.getFriendsList(id);
    return res
  }

  @Patch('accept')
  @UseGuards(JwtAuthGuard)
  async accept(@Body() createRequestDto: CreateRequestDto) {
    const res = await this.friendsService.acceptFriendRequest(createRequestDto);
    return res
  }

  @Patch('delete')
  @UseGuards(JwtAuthGuard)
  async delete(@Body() createRequestDto: CreateRequestDto) {
    const res = await this.friendsService.deleteFriend(createRequestDto);
    return res
  }

}
