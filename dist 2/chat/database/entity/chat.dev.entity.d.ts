import { ChatMessage } from "./chat.message.entity";
export declare enum ChatState {
    PENDING = "PENDING",
    OPEN = "OPEN"
}
export declare class DevChatRoom {
    id: number;
    matchId: number;
    senderId: number;
    receiverId: number;
    status: string;
    message: ChatMessage[];
    createdAt: string;
}
