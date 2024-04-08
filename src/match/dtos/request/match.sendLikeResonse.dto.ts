import { ApiProperty } from "@nestjs/swagger";

export class SendLikeResponseDto {
  @ApiProperty({ example: "1" })
  matchId: number;
  @ApiProperty({ example: "2" })
  me: number;
  @ApiProperty({ example: "my nickname" })
  myNickname: string;
  @ApiProperty({ example: "5" })
  receiverId: number;
  @ApiProperty({ example: "김둑덕" })
  receiverNickname: string;
  @ApiProperty({ example: "PENDING" })
  matchStatus: string;
}
