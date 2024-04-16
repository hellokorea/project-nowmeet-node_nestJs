import { ApiProperty } from "@nestjs/swagger";

class MatchAccept {
  @ApiProperty({ example: "MATCH" })
  matchStatus: string;

  @ApiProperty({ example: "2" })
  senderId: number;

  @ApiProperty({ example: "nickname" })
  senderNickname: string;

  @ApiProperty({ example: "my nickname" })
  myNickname: string;
}

class MatchReject {
  @ApiProperty({ example: "REJECT" })
  matchStatus: string;

  @ApiProperty({ example: "2" })
  senderId: number;
}

class chatRoom {
  @ApiProperty({ example: "1" })
  chatRoomId: number;
  @ApiProperty({ example: "PENDING" })
  chatStatus: string;
  @ApiProperty({ example: "1" })
  matchId: number;
}

export class MatchAcceptResponseDto {
  @ApiProperty({ type: () => MatchAccept })
  match: MatchAccept;
  @ApiProperty({ type: () => chatRoom })
  chatRoom: chatRoom;
}

export class MatchRejectResponseDto {
  @ApiProperty({ type: () => MatchReject })
  match: MatchReject;
}
