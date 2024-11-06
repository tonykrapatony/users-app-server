import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import mongoose, { Model, ObjectId } from 'mongoose';
import { Article } from './schema/article.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateArticleDto } from './dto/create-article.dto';
import { LikeArticleDto } from './dto/like-article.dto';

@Injectable()
export class ArticlesService {
  constructor(@InjectModel(Article.name) private articleModel: Model<Article>) {}

  async createArticle(createArticleDto: CreateArticleDto): Promise<{status: number, createdArticle: Article}> {
    const requiredFields = ['title', 'content', 'userId', 'authorName'];
    const missingFields = requiredFields.filter(field => !createArticleDto[field]);

    if (missingFields.length > 0) {
      throw new HttpException(`Missing fields: ${missingFields.join(', ')}`, HttpStatus.BAD_REQUEST);
    }

    const createdArticle: Article = await this.articleModel.create({
      title: createArticleDto.title,
      content: createArticleDto.content,
      userId: new mongoose.Types.ObjectId(createArticleDto.userId),
      authorName: createArticleDto.authorName,
      likes: 0,
      likesUsers: [],
      date: createArticleDto.date,
    });
    if (createdArticle) {
      return {
        status: HttpStatus.OK,
        createdArticle
      }
    }
    throw new HttpException('Error when creating a post', HttpStatus.BAD_REQUEST);
  }

  async getAllArticles(): Promise<{status: number, articles: Article[]}> {
    const articles = await this.articleModel.find().exec();
    if (articles.length === 0) {
      throw new HttpException('Post not found', HttpStatus.BAD_REQUEST);
    }
    return {
      status: HttpStatus.OK,
      articles
    }
  }

  async getArticleById(id: string): Promise<Article> {
    return this.articleModel.findOne({ _id: id }).exec();
  }

  async getArticleByUserId(userId: string): Promise<{status: number, articles: Article[]}> {
    const articles = await this.articleModel.find({ userId: userId });
    if (articles.length === 0) {
      throw new HttpException('Post not found', HttpStatus.BAD_REQUEST);
    }
    return {
      status: HttpStatus.OK,
      articles
    }
  }

  async likeArticle(id: string, likeArticleDto: LikeArticleDto): Promise<{ status: number; message: string }> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }

    const article = await this.articleModel.findOne({ _id: id });
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
  
    const userAlreadyLiked = article.likesUsers.includes(likeArticleDto.userId);
  
    if (userAlreadyLiked) {
      article.likesUsers = article.likesUsers.filter((user) => user !== likeArticleDto.userId);
      article.likes--;
    } else {
      article.likesUsers.push(likeArticleDto.userId);
      article.likes++;
    }
  
    await article.save();
  
    return {
      status: HttpStatus.OK,
      message: 'Success',
    };
  }
  
  

  async delete(id: string): Promise<{ status: number; message: string }> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }
    const result = await this.articleModel.findByIdAndDelete({ _id: id }).exec();
    if (!result) {
      throw new HttpException('Post not found', HttpStatus.BAD_REQUEST);
    }
    return {
      status: HttpStatus.OK,
      message: 'Post successfully deleted'
    }
  }
}
