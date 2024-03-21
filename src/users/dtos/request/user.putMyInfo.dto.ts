import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class UpdateJobDto {
  @ApiProperty({
    example: "교육직",
  })
  @IsString()
  @IsNotEmpty()
  job: string;
}

export class UpdateIntroduceDto {
  @ApiProperty({
    example: "내 자기소개 수정하고자 하는 글",
  })
  @IsString()
  introduce: string;
}

export class UpdatePreferenceDto {
  @ApiProperty({
    example: ["게임", "오락"],
    isArray: true,
  })
  @IsNotEmpty()
  preference: string[];
}

export class UpdateProfileDto {
  @ApiProperty({
    example: "form-data로 file을 보내야 함",
  })
  @IsString()
  @IsNotEmpty()
  profileImage: string;
}
