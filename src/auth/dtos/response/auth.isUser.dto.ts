import { ApiProperty } from "@nestjs/swagger";

export class IsUserRequsetDto {
  @ApiProperty({ example: "@gmail.com || sub" })
  uuid: string;
}
