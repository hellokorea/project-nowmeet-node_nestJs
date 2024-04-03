import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class ReqPushNotificationDto {
  @ApiProperty({ example: "put fcm title" })
  @IsString()
  title: string;

  @ApiProperty({ example: "put message" })
  @IsString()
  message: string;

  @ApiProperty({ example: "put nickname" })
  @IsString()
  nickname: string;

  @ApiProperty({ example: "put screenName" })
  @IsString()
  screenName: string;

  @ApiProperty({ example: "put chatId" })
  @IsNumber()
  chatId: number;
}
