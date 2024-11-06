import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment-dto';
import { Comment } from './schema/comment.schema';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCommentDto: CreateCommentDto) {
    const res = await this.commentsService.addComment(createCommentDto);
    return res
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async getComments(@Param('id') id: string): Promise<{status: number, comments: Comment[]}> {
    return this.commentsService.getArticleComments(id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Param('id') id: string): Promise<{status: number, message: string}> {
    return this.commentsService.deleteArticleComment(id);
  }

}
