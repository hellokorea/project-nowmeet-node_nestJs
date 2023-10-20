import { ApiProperty } from "@nestjs/swagger";
import { GetProfileResponseDto } from "./user.getProfiles.dto";

class myLocationResDto {
  @ApiProperty({ example: "1" })
  myId: number;

  @ApiProperty({ example: "180.000000" })
  myLongitude: number;

  @ApiProperty({ example: "90.000000" })
  myLatitude: number;
}

export class RefreshLocationUserResDto {
  @ApiProperty({ type: () => myLocationResDto })
  myInfo: myLocationResDto;
  @ApiProperty({ type: () => GetProfileResponseDto, isArray: true })
  nearUser: GetProfileResponseDto;
}
