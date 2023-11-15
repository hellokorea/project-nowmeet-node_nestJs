import { ApiProperty } from "@nestjs/swagger";

export class ChatRoomResponseDto {
  @ApiProperty({ example: "1" })
  chatId: number;

  @ApiProperty({ example: "1" })
  matchId: number;

  @ApiProperty({ example: "5" })
  matchUserId: number;

  @ApiProperty({ example: "매칭된 유저의 닉네임" })
  matchUserNickname: string;

  @ApiProperty({ example: "PENDING" })
  chatStatus: string;

  @ApiProperty({
    example: ["https://nowmeet-profileimg-s3-bucket-dev.s3.ap-northeast-2.amazonaws.com/profileImages/example.jpg"],
    type: [String],
  })
  preSignedUrl: string[];

  @ApiProperty({
    example: "2023-11-15 23:20:41",
  })
  expireTime: string;
}
