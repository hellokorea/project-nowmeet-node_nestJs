import { ApiProperty } from "@nestjs/swagger";

export class MessageResDto {
  @ApiProperty({ example: 4 })
  messageId: number;

  @ApiProperty({ example: 2 })
  rommId: number;

  @ApiProperty({ example: "우리 만날까요?" })
  content: string;

  @ApiProperty({ example: 5 })
  senderId: number;

  @ApiProperty({ example: "김춘배" })
  senderNickname: string;

  @ApiProperty({ example: "2024-03-13 23:13:40" })
  createdAt: string;
}

export class ChatRoomResponseDto {
  @ApiProperty({ example: "2" })
  chatId: number;

  @ApiProperty({ example: "1" })
  matchId: number;

  @ApiProperty({ example: "5" })
  matchUserId: number;

  @ApiProperty({ example: "김춘배" })
  matchUserNickname: string;

  @ApiProperty({ type: () => MessageResDto, isArray: true })
  message: MessageResDto;

  @ApiProperty({ example: "PENDING" })
  chatStatus: string;

  @ApiProperty({
    example: ["https://nowmeet-profileimg-s3-bucket-dev.s3.ap-northeast-2.amazonaws.com/profileImages/example.jpg"],
    type: [String],
  })
  preSignedUrl: string[];

  @ApiProperty({
    example: "2024-03-14 23:20:41",
  })
  expireTime: string;
}
