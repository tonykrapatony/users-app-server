export class CreateItemDto {
  readonly userId: string;
  readonly acceptedFriends: string[]
  readonly requestedFriends: string[]
}