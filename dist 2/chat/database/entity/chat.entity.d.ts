import { ChatMessage } from "./chat.message.entity";
export declare enum ChatState {
    PENDING = "PENDING",
    OPEN = "OPEN",
    DISCONNECT_END = "DISCONNECT_END",
    EXPIRE_END = "EXPIRE_END",
    RECEIVER_EXIT = "RECEIVER_EXIT",
    SENDER_EXIT = "SENDER_EXIT"
}
export declare class ChatRoom {
    id: number;
    matchId: number;
    senderId: number;
    receiverId: number;
    status: string;
    message: ChatMessage[];
    expireTime: Date;
    disconnectTime: Date;
    createdAt: string;
}
