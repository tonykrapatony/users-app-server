import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({required: true})
  firstName: string;

  @Prop({required: true})
  lastName: string;

  @Prop({required: true})
  email: string;

  @Prop({required: false})
  phone: string;

  @Prop({required: true})
  password: string;

  @Prop({required: false})
  photo: string;

  @Prop({required: false})
  friends: string;
}

export const UserSchema = SchemaFactory.createForClass(User);