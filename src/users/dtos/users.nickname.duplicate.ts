import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UserNicknameDuplicateDto {
  @ApiProperty({
    example: "김철수",
    description: "nickname",
  })
  @IsString()
  @IsNotEmpty()
  nickname: string;
}
