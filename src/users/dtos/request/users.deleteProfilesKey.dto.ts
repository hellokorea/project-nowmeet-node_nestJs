import { ApiProperty } from "@nestjs/swagger";

export class DeleteUserProfileIndex {
  @ApiProperty({
    example: 1,
  })
  deleteIndex: number;
}
