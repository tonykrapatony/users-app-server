import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Article } from './schema/article.schema';
import { JwtAuthGuard } from '../auth/auth.guard';
import { LikeArticleDto } from './dto/like-article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private articleService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createArticleDto: CreateArticleDto) {
    const res = await this.articleService.createArticle(createArticleDto);
    return res
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<{status: number, articles: Article[]}> {
    return this.articleService.getAllArticles();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<Article> {
    return this.articleService.getArticleById(id);
  }
  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  async findUserArticles(@Param('id') id: string): Promise<{status: number, articles: Article[]}> {
    return this.articleService.getArticleByUserId(id);
  }

  @Put(':id/like')
  @UseGuards(JwtAuthGuard)
  async updateOne(@Param('id') id: string, @Body() likeArticleDto: LikeArticleDto): Promise<{ status: number; message: string }> {
    return this.articleService.likeArticle(id, likeArticleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string): Promise<{ status: number; message: string }> {
    return await this.articleService.delete(id);
  }
}
