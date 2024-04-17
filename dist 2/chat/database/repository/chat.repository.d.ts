import { ChatRoom } from "../entity/chat.entity";
import { EntityManager, Repository } from "typeorm";
import { DevChatRoom } from "../entity/chat.dev.entity";
export declare class ChatsRepository {
    private chatsRoomRepository;
    private devChatsRoomRepository;
    constructor(chatsRoomRepository: Repository<ChatRoom>, devChatsRoomRepository: Repository<DevChatRoom>);
    findChatsByUserId(userId: number): Promise<ChatRoom[]>;
    findChatsByUserIds(profileId: number, loggedId: number): Promise<ChatRoom[] | null>;
    findOneChatRoomsByChatId(chatId: number): Promise<ChatRoom>;
    findOneChatRoomsByMatchId(matchId: number): Promise<ChatRoom>;
    findExpireChats(): Promise<ChatRoom[]>;
    findDisconnectChats(): Promise<ChatRoom[]>;
    createChatRoom(matchId: number, senderId: number, receiverId: number, expireTime: Date): Promise<ChatRoom>;
    saveChatData(chat: ChatRoom): Promise<ChatRoom>;
    removeChatRoom(chat: ChatRoom): Promise<ChatRoom>;
    findOneDevChatRoomsByMatchId(matchId: number): Promise<DevChatRoom>;
    saveDevChatData(chat: DevChatRoom): Promise<DevChatRoom>;
    createDevChatRoom(matchId: number, senderId: number, receiverId: number): Promise<ChatRoom>;
    deleteChatDataByUserId(txManager: EntityManager, userId: number): Promise<void>;
    deleteDevChatDataByUserId(txManager: EntityManager, userId: number): Promise<void>;
}
