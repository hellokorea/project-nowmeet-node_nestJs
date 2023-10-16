import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class PutMyInfoResponseDto {
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
  @IsString()
  @IsNotEmpty()
  preference: string[];
}
