import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
  @Prop({required: true})
  text: string;

  @Prop({required: true})
  articleId: string;

  @Prop({required: true})
  userId: string;

  @Prop({required: true})
  date: string;

}

export const CommentSchema = SchemaFactory.createForClass(Comment);