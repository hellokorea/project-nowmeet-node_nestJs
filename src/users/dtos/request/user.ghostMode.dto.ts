import { ApiProperty } from "@nestjs/swagger";

export class GhostModeDto {
  @ApiProperty({ example: true })
  setting: boolean;
}
