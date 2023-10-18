import { ApiProperty } from "@nestjs/swagger";

class S3ObjectDto {
  @ApiProperty({ example: "hdf1qw18cd98f00awe98ecf842v7e" })
  ETag: string;
}

export class UploadResponseDto {
  @ApiProperty({ example: "usersProfileImges/79623158372_10_Exmaple.png" })
  key: string;

  @ApiProperty({ type: S3ObjectDto })
  s3Object: S3ObjectDto;

  @ApiProperty({ example: "image/png" })
  contentType: string;
}

export class DeleteResponseDto {
  @ApiProperty({
    example: "usersProfileImges/79623158372_10_Exmaple.png",
  })
  key: string;
}
