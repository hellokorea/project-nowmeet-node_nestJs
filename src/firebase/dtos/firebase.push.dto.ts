import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ReqPushNotificationDto {
  @ApiProperty({
    example: "put fcm token ",
  })
  @IsString()
  fcmToken: string;

  @ApiProperty({ example: "put fcm title" })
  @IsString()
  title: string;

  @ApiProperty({ example: "put message" })
  @IsString()
  message: string;
}
