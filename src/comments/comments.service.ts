import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Comment } from './schema/comment.schema';
import { CreateCommentDto } from './dto/create-comment-dto';
import { ArticlesService } from 'src/articles/articles.service';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private comentModel: Model<Comment>, private articlesService: ArticlesService) {}

  async addComment(createCommentDto: CreateCommentDto) {
    if (!mongoose.Types.ObjectId.isValid(createCommentDto.articleId)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }
    const article = await this.articlesService.getArticleById(createCommentDto.articleId);
    if (!article ) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND)
    }
    const comment = await this.comentModel.create({
      text: createCommentDto.text,
      articleId: new mongoose.Types.ObjectId(createCommentDto.articleId),
      userId: createCommentDto.userId,
      date: createCommentDto.date,
    });
    return {
      status: HttpStatus.OK,
      message: 'Success',
    };
  }

  async getArticleComments(id: string): Promise<{status: number, comments: Comment[]}> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }
    const article = await this.articlesService.getArticleById(id);
    if (!article ) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND)
    }
    const comments = await this.comentModel.find({ articleId: id });
    return {
      status: HttpStatus.OK,
      comments,
    };
  }
  
  async deleteArticleComment(id: string): Promise<{status: number, message: string}> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }
    const result = await this.comentModel.findByIdAndDelete({ _id: id }).exec();
    if (!result) {
      throw new HttpException('Commnet not found', HttpStatus.BAD_REQUEST);
    }
    return {
      status: HttpStatus.OK,
      message: 'Commnet successfully deleted'
    }
  }

}
