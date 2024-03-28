import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ChatGateway } from "src/chat/gateway/chat.gateway";
import { User } from "src/users/database/entity/users.entity";
import { UsersRepository } from "src/users/database/repository/users.repository";
import * as jwt from "jsonwebtoken";
import { ChatsRepository } from "./../chat/database/repository/chat.repository";
import { ChatRoom } from "src/chat/database/entity/chat.entity";

@Injectable()
export class RecognizeService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly chatsRepository: ChatsRepository
  ) {}

  async validateUser(id: number): Promise<User> {
    const user = await this.usersRepository.findOneById(id);

    if (!user) throw new NotFoundException("존재하지 않는 유저 입니다");

    return user;
  }

  async verifyFindChatRoom(chatId: number, loggedId: number): Promise<ChatRoom> {
    const user = await this.usersRepository.findOneById(loggedId);

    if (!user) {
      throw new NotFoundException("해당 유저가 존재하지 않습니다");
    }

    const findChat = await this.chatsRepository.findOneChatRoomsByChatId(chatId);

    if (!findChat) {
      throw new NotFoundException("해당 채팅방이 존재하지 않습니다");
    }

    if (findChat.receiverId === null || findChat.senderId === null) {
      throw new NotFoundException("상대방 유저가 존재하지 않습니다");
    }

    const isUser = await this.chatsRepository.findChatsByUserId(loggedId);

    if (!isUser.length) {
      throw new BadRequestException("채팅방 내 유저 정보가 존재하지 않습니다");
    }

    return findChat;
  }

  async verifyWebSocketToken(token: string): Promise<User> {
    if (!token) throw new UnauthorizedException("WebSocket token is missing");

    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== "object") {
      throw new UnauthorizedException("WebSocket Invalid token");
    }

    const issuer = (decoded as jwt.JwtPayload).iss;
    if (!issuer) throw new UnauthorizedException("WebSocket Issuer is missing in token");

    let user: User;

    if (issuer.includes("accounts.google.com")) {
      user = await this.usersRepository.findOneGetByEmail(decoded.email);
    } else if (issuer.includes("appleid.apple.com")) {
      user = await this.usersRepository.findOneAppleSub(decoded.sub);
    }

    const result = await this.validateUser(user.id);

    return result;
  }

  async saveFcmToken(id: number, fcmToken: string) {
    const user = await this.usersRepository.findOneById(id);

    user.fcmToken = fcmToken;

    await this.usersRepository.saveUser(user);
  }
}
