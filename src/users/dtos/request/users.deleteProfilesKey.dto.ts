import { ApiProperty } from "@nestjs/swagger";

export class DeleteUserProfileKey {
  @ApiProperty({
    example: "profileImages/1697784931200_3.JPG",
  })
  deleteKey: string;
}
