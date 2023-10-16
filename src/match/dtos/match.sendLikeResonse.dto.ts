import { ApiProperty } from "@nestjs/swagger";

export class SendLikeResponseDto {
  @ApiProperty({ example: "1" })
  matchId: number;
  @ApiProperty({ example: "2" })
  senderId: number;
  @ApiProperty({ example: "5" })
  receiverId: number;
  @ApiProperty({ example: "PENDING" })
  matchStatus: string;
}
