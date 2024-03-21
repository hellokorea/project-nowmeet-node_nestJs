import { ApiProperty } from "@nestjs/swagger";

export class IsUserRequsetDto {
  @ApiProperty({ example: "uuid" })
  uuid: string;
}
