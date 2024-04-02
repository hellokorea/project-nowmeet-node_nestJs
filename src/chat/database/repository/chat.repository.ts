import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatRoom } from "../entity/chat.entity";
import { EntityManager, FindOneOptions, LessThan, Repository } from "typeorm";
import { DevChatRoom } from "../entity/chat.dev.entity";
import * as moment from "moment";

@Injectable()
export class ChatsRepository {
  constructor(
    @InjectRepository(ChatRoom) private chatsRoomRepository: Repository<ChatRoom>,
    @InjectRepository(DevChatRoom) private devChatsRoomRepository: Repository<DevChatRoom>
  ) {}

  //*---Find Logic
  async findChatsByUserId(userId: number): Promise<ChatRoom[]> {
    const chats = await this.chatsRoomRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
      relations: ["message"],
    });

    return chats;
  }

  async findChatsByUserIds(profileId: number, loggedId: number): Promise<ChatRoom[] | null> {
    const option: FindOneOptions<ChatRoom> = {
      where: [
        { senderId: loggedId, receiverId: profileId },
        { senderId: profileId, receiverId: loggedId },
      ],
    };

    return await this.chatsRoomRepository.find(option);
  }

  async findOneChatRoomsByChatId(chatId: number): Promise<ChatRoom> {
    return await this.chatsRoomRepository.findOne({ where: { id: chatId }, relations: ["message"] });
  }

  async findOneChatRoomsByMatchId(matchId: number): Promise<ChatRoom> {
    return await this.chatsRoomRepository.findOne({ where: { matchId: matchId } });
  }

  async findExpireChats() {
    const currentKoreaTime = moment().tz("Asia/Seoul").toDate();
    return this.chatsRoomRepository.find({
      where: {
        expireTime: LessThan(currentKoreaTime),
        status: "PENDING",
      },
    });
  }

  async findDisconnectChats() {
    const currentKoreaTime = moment().tz("Asia/Seoul").toDate();
    return this.chatsRoomRepository.find({ where: { disconnectTime: LessThan(currentKoreaTime), status: "OPEN" } });
  }

  //*---Create Logic
  async createChatRoom(matchId: number, senderId: number, receiverId: number, expireTime: Date) {
    return this.chatsRoomRepository.create({
      matchId,
      senderId,
      receiverId,
      expireTime,
    });
  }

  //*---Save Logic
  async saveChatData(chat: ChatRoom): Promise<ChatRoom> {
    return this.chatsRoomRepository.save(chat);
  }

  //*---Delete Logic
  async removeChatRoom(chat: ChatRoom): Promise<ChatRoom> {
    return await this.chatsRoomRepository.remove(chat);
  }

  //*----Dev Logic
  async findOneDevChatRoomsByMatchId(matchId: number): Promise<DevChatRoom> {
    return await this.devChatsRoomRepository.findOne({ where: { matchId: matchId } });
  }

  async saveDevChatData(chat: DevChatRoom): Promise<DevChatRoom> {
    return this.devChatsRoomRepository.save(chat);
  }

  async createDevChatRoom(matchId: number, senderId: number, receiverId: number) {
    return this.chatsRoomRepository.create({
      matchId: matchId,
      senderId: senderId,
      receiverId: receiverId,
    });
  }

  //*---Delete Account Logic
  async deleteChatDataByUserId(txManager: EntityManager, userId: number): Promise<void> {
    const chatsRoomRepository = txManager.getRepository(ChatRoom);
    const chats = await chatsRoomRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
    });

    await chatsRoomRepository.remove(chats);
  }

  async deleteDevChatDataByUserId(txManager: EntityManager, userId: number): Promise<void> {
    const devChatsRoomRepository = txManager.getRepository(DevChatRoom);
    const chats = await devChatsRoomRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
    });

    await devChatsRoomRepository.remove(chats);
  }
}
