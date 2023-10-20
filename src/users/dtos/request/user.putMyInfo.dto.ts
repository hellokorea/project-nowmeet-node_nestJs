import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class UpdateProfileDto {
  @ApiProperty({
    example: "교육직",
  })
  @IsString()
  @IsNotEmpty()
  job: string;

  @ApiProperty({
    example: "내 자기소개 수정하고자 하는 글",
  })
  @IsString()
  @IsNotEmpty()
  introduce: string;

  @ApiProperty({
    example: "취향 변경",
  })
  @IsArray()
  @IsNotEmpty()
  preference: string[];

  @ApiProperty({
    example: "profileImages/1697786230979_2.JPG",
    isArray: true,
  })
  @IsString()
  @IsNotEmpty()
  profilesImages: string[];
}
