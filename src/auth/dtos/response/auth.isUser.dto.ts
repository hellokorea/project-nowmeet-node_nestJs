import { ApiProperty } from "@nestjs/swagger";

export class IsUserRequsetDto {
  @ApiProperty({ example: "google@gmail.com || sub" })
  uuid: string;
}
