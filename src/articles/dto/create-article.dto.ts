export class CreateArticleDto {
  readonly title: string;
  readonly content: string;
  readonly userId: string;
  readonly authorName: string;
  readonly likes: number;
  readonly likesUsers: string[];
  readonly date: string;
}