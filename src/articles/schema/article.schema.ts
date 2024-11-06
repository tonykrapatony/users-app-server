import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ArticleDocument = HydratedDocument<Article>;

@Schema()
export class Article {
  @Prop({required: true})
  title: string;

  @Prop({required: true})
  content: string;

  @Prop({required: true})
  userId: string;

  @Prop({required: true})
  authorName: string;

  @Prop({required: false})
  likes: number;

  @Prop({required: false})
  likesUsers: string[];

  @Prop({required: true})
  date: string;

}

export const ArticleSchema = SchemaFactory.createForClass(Article);