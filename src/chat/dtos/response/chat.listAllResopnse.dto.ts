import { ApiProperty } from "@nestjs/swagger";

export class ChatAllListResponseDto {
  @ApiProperty({ example: "1" })
  chatId: number;

  @ApiProperty({ example: "1" })
  matchId: number;

  @ApiProperty({ example: "2" })
  me: number;

  @ApiProperty({ example: "5" })
  matchUserId: number;

  @ApiProperty({ example: "매칭된 유저의 닉네임" })
  matchUserNickname: string;
}
