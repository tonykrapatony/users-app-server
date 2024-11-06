import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FriendDocument = HydratedDocument<Friend>;

@Schema()
export class Friend {
  @Prop({required: true})
  userId: string;

  @Prop({required: false})
  acceptedFriends: string[];

  @Prop({required: false})
  requestedFriends: string[];

}

export const FriendsSchema = SchemaFactory.createForClass(Friend);