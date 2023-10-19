import { ApiProperty } from "@nestjs/swagger";
import { User } from "../entity/users.entity";

export class UserProfileResponseDto {
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

  @ApiProperty({ example: "이것, 저것, 그것, 무엇" })
  preference: string[];

  @ApiProperty({ example: "사진1, 사진2, 사진3" })
  profileImage?: string[];

  @ApiProperty({ example: "180.000000" })
  longitude: number;

  @ApiProperty({ example: "-90.000000" })
  latitude: number;

  @ApiProperty({ example: "1.jpg, 2.png" })
  profileImages: string[];

  constructor(user: User) {
    this.nickname = user.nickname;
    this.sex = user.sex;
    this.birthDate = user.birthDate;
    this.tall = user.tall;
    this.job = user.job;
    this.introduce = user.introduce;
    this.preference = user.preference;
    this.longitude = user.longitude;
    this.latitude = user.latitude;
    this.profileImages = user.profileImages;
  }
}
