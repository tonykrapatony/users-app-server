import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Friend, FriendDocument } from './schema/friends.schema';
import { Model } from 'mongoose';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class FriendsService {
  constructor(@InjectModel(Friend.name) private friendModel: Model<FriendDocument>) { }

  async createItem(createItemDto: CreateItemDto): Promise<FriendDocument> {
    const item = await this.friendModel.create(createItemDto);
    return item;
  }


  async sendFriendRequest(createRequestDto: CreateRequestDto): Promise<{ status: number, message: string, data: FriendDocument }> {
    const { toUserId, fromUserId } = createRequestDto;
    const toUserFriend = await this.friendModel.findOne({ userId: toUserId });
    if (!toUserFriend) {
      throw new NotFoundException('User not found');
    }

    if (toUserFriend.requestedFriends.includes(fromUserId)) {
      throw new HttpException('The request has already been sent', HttpStatus.CONFLICT);
    }

    toUserFriend.requestedFriends.push(fromUserId);
    await toUserFriend.save();
    return {
      status: HttpStatus.OK,
      message: "The request was sent",
      data: toUserFriend
    }
  }

  async getFriendsList(id: string): Promise<{ status: number; message: string, data: Partial<FriendDocument> }> {
    const friends = await this.friendModel.findOne({ userId: id });
    if (!friends) {
      throw new NotFoundException('Friends not found');
    }
    return {
      status: HttpStatus.OK,
      message: "Success",
      data: friends
    }
  }

  async acceptFriendRequest(createRequestDto: CreateRequestDto): Promise<{ status: number, message: string }> {
    const { toUserId, fromUserId } = createRequestDto;

    const toUserFriend = await this.friendModel.findOne({ userId: toUserId });
    if (!toUserFriend) {
      throw new NotFoundException('User not found');
    }

    if (!toUserFriend.requestedFriends.includes(fromUserId)) {
      throw new HttpException('Friend request not found', HttpStatus.NOT_FOUND);
    }

    const fromUser = await this.friendModel.findOne({ userId: fromUserId });

    toUserFriend.acceptedFriends.push(fromUserId);
    fromUser.acceptedFriends.push(toUserId);

    toUserFriend.requestedFriends = toUserFriend.requestedFriends.filter(
      (userId) => userId !== fromUserId
    );

    await fromUser.save();
    await toUserFriend.save();

    return {
      status: HttpStatus.OK,
      message: "Friend request accepted",
    }
  }

  async deleteFriend(createRequestDto: CreateRequestDto): Promise<{ status: number, message: string }> {
    const { toUserId, fromUserId } = createRequestDto;

    const fromUser = await this.friendModel.findOne({ userId: fromUserId });
    const toUserFriend = await this.friendModel.findOne({ userId: toUserId });

    if (!toUserFriend) {
      throw new NotFoundException('User not found');
    }

    if (!fromUser) {
      throw new HttpException('Friend not found', HttpStatus.NOT_FOUND);
    }

    fromUser.acceptedFriends = fromUser.acceptedFriends.filter(
      (userId) => userId !== toUserId
    );
    toUserFriend.acceptedFriends = toUserFriend.acceptedFriends.filter(
      (userId) => userId !== fromUserId
    );

    fromUser.requestedFriends = fromUser.acceptedFriends.filter(
      (userId) => userId !== toUserId
    );
    toUserFriend.requestedFriends = toUserFriend.acceptedFriends.filter(
      (userId) => userId !== fromUserId
    );

    await fromUser.save();
    await toUserFriend.save();

    return {
      status: HttpStatus.OK,
      message: "Friend was deleted",
    }
  }
} 
