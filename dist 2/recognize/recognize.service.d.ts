import { User } from "src/users/database/entity/users.entity";
import { UsersRepository } from "src/users/database/repository/users.repository";
import { ChatsRepository } from "./../chat/database/repository/chat.repository";
import { ChatRoom } from "src/chat/database/entity/chat.entity";
export declare class RecognizeService {
    private readonly usersRepository;
    private readonly chatsRepository;
    constructor(usersRepository: UsersRepository, chatsRepository: ChatsRepository);
    validateUser(id: number): Promise<User>;
    verifyFindChatRoom(chatId: number, loggedId: number): Promise<ChatRoom>;
    verifyWebSocketToken(token: string): Promise<User>;
    saveFcmToken(id: number, fcmToken: string): Promise<void>;
}
