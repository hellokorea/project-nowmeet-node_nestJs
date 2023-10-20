import { ApiProperty } from "@nestjs/swagger";

export class IsUserResponseDto {
  token?: string;
}

export class IsUserRequsetDto {
  @ApiProperty({ example: "test@gmail.com" })
  email: string;
}
