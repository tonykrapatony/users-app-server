export class CreateUserDto {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone: number;
  readonly friends: string;
  readonly password: string;
}