import { IsNotEmpty, IsString } from "class-validator";

export class UserNicknameDuplicateDto {
  @IsString()
  @IsNotEmpty()
  nickname: string;
}
