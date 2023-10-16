import { ApiProperty } from "@nestjs/swagger";

export class IsUserResponseDto {
  token?: string;
}

export class IsUserRequsetDto {
  @ApiProperty({ example: "tnczl1234@gmail.com" })
  email: string;
}
