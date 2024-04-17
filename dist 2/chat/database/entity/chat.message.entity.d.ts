import { ChatRoom } from "./chat.entity";
import { User } from "src/users/database/entity/users.entity";
export declare class ChatMessage {
    id: number;
    chatRoom: ChatRoom;
    sender: User;
    content: string;
    createdAt: string;
}
