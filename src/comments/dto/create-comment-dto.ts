export class CreateCommentDto {
  readonly text: string;
  readonly articleId: string;
  readonly userId: string;
  readonly date: string;
}