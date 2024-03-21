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

  @ApiProperty({ example: "최신 메시지" })
  lastMessage: string;

  @ApiProperty({ example: "김덕배" })
  matchUserNickname: string;

  @ApiProperty({ example: "statusD" })
  chatStatus: string;

  @ApiProperty({
    example: [
      "https://nowmeet-profileimg-s3-bucket.s3.ap-northeast-2.amazonaws.com/profileImages/...",
      "https://nowmeet-profileimg-s3-bucket.s3.ap-northeast-2.amazonaws.com/profileImages/...",
    ],
    isArray: true,
  })
  PreSignedUrl: string[];
}
