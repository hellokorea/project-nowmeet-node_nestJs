import { ApiProperty } from "@nestjs/swagger";

export class IsUserRequsetDto {
  @ApiProperty({ example: "test@gmail.com" })
  email: string;
}
