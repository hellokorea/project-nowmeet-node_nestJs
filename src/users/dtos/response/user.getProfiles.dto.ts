import { ApiProperty } from "@nestjs/swagger";
import { ProfileImagesDto } from "src/match/dtos/response/match.likeBoxResponse.dto";

export class GetProfileResponseDto {
  @ApiProperty({ example: "홍길동" })
  nickname: string;

  @ApiProperty({ example: "남자" })
  sex: string;

  @ApiProperty({ example: "19940730" })
  birthDate: string;

  @ApiProperty({ example: "182" })
  tall: string;

  @ApiProperty({ example: "전문직" })
  job: string;

  @ApiProperty({ example: "안녕하십니까부리" })
  introduce: string;

  @ApiProperty({ example: ["이것, 저것, 그것, 무엇"], isArray: true })
  preference: string[];

  @ApiProperty({ example: false })
  ghostMode: boolean;

  @ApiProperty({ example: "180.000000" })
  longitude: number;

  @ApiProperty({ example: "-90.000000" })
  latitude: number;

  @ApiProperty({ example: "PENDING" })
  matchStatus: string;

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
