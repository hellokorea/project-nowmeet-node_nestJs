import { ApiProperty } from "@nestjs/swagger";

export class SendBoxResponseDto {
  @ApiProperty({ example: "1" })
  matchId: number;
  @ApiProperty({ example: "PENDING" })
  isMatch: string;
  @ApiProperty({ example: "5" })
  receiverId: number;
  @ApiProperty({ example: "2023-11-05 21:22:23" })
  expireMatch: Date;
}

export class ReceiveBoxResponseDto {
  @ApiProperty({ example: "1" })
  matchId: number;
  @ApiProperty({ example: "PENDING" })
  isMatch: string;
  @ApiProperty({ example: "2" })
  senderId: number;
  @ApiProperty({ example: "2023-11-05 21:22:23" })
  expireMatch: Date;
}
