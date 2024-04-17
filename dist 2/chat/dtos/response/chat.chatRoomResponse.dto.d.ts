export declare class MessageResDto {
    messageId: number;
    rommId: number;
    content: string;
    senderId: number;
    senderNickname: string;
    createdAt: string;
}
export declare class ChatRoomResponseDto {
    chatId: number;
    matchId: number;
    matchUserId: number;
    matchUserNickname: string;
    message: MessageResDto;
    chatStatus: string;
    preSignedUrl: string[];
    expireTime: string;
}
