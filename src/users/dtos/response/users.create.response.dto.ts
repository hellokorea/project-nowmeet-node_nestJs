import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ProfileImagesDto } from "src/match/dtos/response/match.likeBoxResponse.dto";

export class UserCreateResDto {
  @ApiProperty({
    example: "23",
    description: "id",
  })
  id: number;

  @ApiProperty({
    example: "test@naver.com",
    description: "email",
  })
  email: string;

  @ApiProperty({
    example: "nowmmet대박가자",
    description: "nickname",
  })
  nickname: string;

  @ApiProperty({
    example: "남자",
    description: "sex",
  })
  sex: string;

  @ApiProperty({
    example: "1994-07-30",
    description: "birthDate",
  })
  birthDate: string;

  @ApiProperty({
    example: "183",
    description: "tall",
  })
  tall: string;

  @ApiProperty({
    example: "전문직",
    description: "job",
  })
  job: string;

  @ApiProperty({
    example: "여! 반갑다. 내 이름은 홍길동이고, 아버지를 아버지라 부르지 못하지.",
    description: "introduce",
  })
  introduce: string;

  @ApiProperty({
    example: "게임, 독서, 술, 여행",
    description: "preference",
    isArray: true,
  })
  preference: string[];

  @ApiProperty({
    example: "180.000000",
    description: "longitude",
  })
  longitude: number;

  @ApiProperty({
    example: "-90.000000",
    description: "latitude",
  })
  latitude: number;

  @ApiProperty({
    example: "0",
    description: "gem",
  })
  gem: number;

  @ApiProperty({
    example: ["profileImages/1697729883735_%EA%B9%80%E....jpg, profileImages/1697729883735_%EA%B9%80%E....jpg"],
    description: "profileImages",
  })
  profileImages: string[];
}
