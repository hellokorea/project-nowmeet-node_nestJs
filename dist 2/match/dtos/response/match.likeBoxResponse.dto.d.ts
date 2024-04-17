export declare class ProfileImagesDto {
    ProfileImages: string[];
    PreSignedUrl: string[];
}
export declare class SendBoxResponseDto {
    matchId: number;
    isMatch: string;
    receiverId: number;
    receiverNickname: string;
    expireMatch: Date;
    profileImages: ProfileImagesDto;
}
export declare class ReceiveBoxResponseDto {
    matchId: number;
    isMatch: string;
    senderId: number;
    senderNickname: string;
    expireMatch: Date;
    profileImages: ProfileImagesDto;
}
