import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UserCreateDto {
  @ApiProperty({
    example: "test@gmail.com",
    description: "email",
  })
  email: string | null;

  @ApiProperty({
    example: "helloWorld",
    description: "nickname",
  })
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({
    example: "남자",
    description: "sex",
  })
  @IsString()
  @IsNotEmpty()
  sex: string;

  @ApiProperty({
    example: "1994-07-30",
    description: "birthDate",
  })
  @IsString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({
    example: "183",
    description: "tall",
  })
  @IsString()
  @IsNotEmpty()
  tall: string;

  @ApiProperty({
    example: "전문직",
    description: "job",
  })
  @IsString()
  @IsNotEmpty()
  job: string;

  @ApiProperty({
    example: "잘 부탁드립니다.",
    description: "introduce",
  })
  @IsString()
  @IsNotEmpty()
  introduce: string;

  @ApiProperty({
    example: ["게임, 독서, 술, 여행"],
    description: "preference",
    isArray: true,
  })
  @IsString()
  @IsNotEmpty()
  preference: string[];

  @ApiProperty({
    example: "180.000000",
    description: "longitude",
  })
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
    example: "-90.000000",
    description: "latitude",
  })
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    example: "Google = Disuse || Apple = apple.sub.12345",
  })
  sub: string;

  @ApiProperty({
    example: ["Example.jpg", "Example.jpg,"],
    description: "profileImages",
    isArray: true,
  })
  profileImages: string[];
}
