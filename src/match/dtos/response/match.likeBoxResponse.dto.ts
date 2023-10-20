import { ApiProperty } from "@nestjs/swagger";

export class ProfileImagesDto {
  @ApiProperty({
    example: [
      "profileImages/1697729883735_%EA%B9%80%EC%A0%95%EB%8F%99%EB%8B%98.jpg",
      "profileImages/1697729883735_%EA%B9%80%EC%A0%95%EB%8F%99%EB%8B%98.jpg",
    ],
    isArray: true,
  })
  ProfileImages: string[];

  @ApiProperty({
    example: [
      "https://nowmeet-profileimg-s3-bucket.s3.ap-northeast-2.amazonaws.com/profileImages/...",
      "https://nowmeet-profileimg-s3-bucket.s3.ap-northeast-2.amazonaws.com/profileImages/...",
    ],
    isArray: true,
  })
  PreSignedUrl: string[];
}

export class SendBoxResponseDto {
  @ApiProperty({ example: "1" })
  matchId: number;
  @ApiProperty({ example: "PENDING" })
  isMatch: string;
  @ApiProperty({ example: "5" })
  receiverId: number;
  @ApiProperty({ example: "박옥삼" })
  receiverNickname: string;
  @ApiProperty({ example: "2023-11-05 21:22:23" })
  expireMatch: Date;
  @ApiProperty()
  profileImages: ProfileImagesDto;
}

export class ReceiveBoxResponseDto {
  @ApiProperty({ example: "1" })
  matchId: number;
  @ApiProperty({ example: "PENDING" })
  isMatch: string;
  @ApiProperty({ example: "2" })
  senderId: number;
  @ApiProperty({ example: "김덕배" })
  senderNickname: string;
  @ApiProperty({ example: "2023-11-05 21:22:23" })
  expireMatch: Date;
  @ApiProperty()
  profileImages: ProfileImagesDto;
}
