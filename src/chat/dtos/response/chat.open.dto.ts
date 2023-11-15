import { ApiProperty } from "@nestjs/swagger";

export class OpenChatResponseDto {
  @ApiProperty({ example: "OPEN" })
  chatStatus: string;

  @ApiProperty({ example: "2023-11-15 23:20:41" })
  disconnectTime: string;
}
