declare class MatchAccept {
    matchStatus: string;
    senderId: number;
    senderNickname: string;
    myNickname: string;
}
declare class MatchReject {
    matchStatus: string;
    senderId: number;
}
declare class chatRoom {
    chatRoomId: number;
    chatStatus: string;
    matchId: number;
}
export declare class MatchAcceptResponseDto {
    match: MatchAccept;
    chatRoom: chatRoom;
}
export declare class MatchRejectResponseDto {
    match: MatchReject;
}
export {};
