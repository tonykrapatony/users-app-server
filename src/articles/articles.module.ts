import { forwardRef, Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from './schema/article.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService],
  imports: [
    MongooseModule.forFeature([{name: Article.name, schema: ArticleSchema}]),
    forwardRef(() => AuthModule)
  ],
  exports: [ArticlesService]
})
export class ArticlesModule {}
