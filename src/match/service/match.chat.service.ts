import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from "@nestjs/common";
import { ChatGateway } from "src/chat/gateway/chat.gateway";
import { ChatState } from "src/chat/database/entity/chat.entity";
import { UserRequestDto } from "src/users/dtos/request/users.request.dto";
import { UsersRepository } from "src/users/database/repository/users.repository";
import { RecognizeService } from "../../recognize/recognize.service";
import * as moment from "moment";
import { AwsService } from "src/aws.service";
import { ChatService } from "./../../chat/service/chat.service";
import { ChatsRepository } from "./../../chat/database/repository/chat.repository";
import { ChatTimerService } from "./../../chat/service/chat.timer.service";
import { ChatMessagesRepository } from "./../../chat/database/repository/chat.message.repository";

@Injectable()
export class MatchChatService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly chatsRepository: ChatsRepository,
    private readonly chatMessagesRepository: ChatMessagesRepository,
    private readonly chatService: ChatService,
    private readonly chatTimerService: ChatTimerService,
    private readonly recognizeService: RecognizeService,
    private readonly awsService: AwsService
  ) {}

  async getChatRoomsAllList(req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.recognizeService.validateUser(loggedId);

    const findChats = await this.chatsRepository.findChatsByUserId(user.id);

    if (!findChats.length) {
      return null;
    }

    const chatListFilter = findChats.filter((chat) => {
      return (
        (loggedId === chat.senderId && chat.status !== ChatState.SENDER_EXIT) ||
        (loggedId === chat.receiverId && chat.status !== ChatState.RECEIVER_EXIT)
      );
    });

    const chatListPromises = chatListFilter.map(async (chat) => {
      let me: number;
      let matchUserId: number;

      if (loggedId === chat.receiverId || loggedId === chat.senderId) {
        me = loggedId;
        matchUserId = loggedId === chat.receiverId ? chat.senderId : chat.receiverId;
      }

      const oppUser = await this.usersRepository.findOneById(matchUserId);
      const preSignedUrl = await this.awsService.createPreSignedUrl(oppUser.profileImages);

      let lastMessageData = await this.chatMessagesRepository.findOneLastMessage(chat.id);

      let lastMessage: string;

      if (!lastMessageData) {
        lastMessage = "";
      } else {
        lastMessage = lastMessageData.content;
      }

      return {
        chatId: chat.id,
        matchId: chat.matchId,
        me,
        matchUserId,
        lastMessage: lastMessage,
        matchUserNickname: oppUser.nickname,
        chatStatus: chat.status,
        preSignedUrl,
      };
    });

    const chatList = await Promise.all(chatListPromises);

    return chatList;
  }

  async getUserChatRoom(chatId: number, req: UserRequestDto) {
    const loggedId = req.user.id;
    const findChat = await this.recognizeService.verifyFindChatRoom(chatId, loggedId);

    let chathUserId: number;

    loggedId === findChat.receiverId ? (chathUserId = findChat.senderId) : (chathUserId = findChat.receiverId);

    const opponentUser = await this.usersRepository.findOneById(chathUserId);
    const preSignedUrl = await this.awsService.createPreSignedUrl(opponentUser.profileImages);
    const expireTime = moment(findChat.expireTime).format("YYYY-MM-DD HH:mm:ss");
    const disconnectTime = moment(findChat.disconnectTime).format("YYYY-MM-DD HH:mm:ss");
    const messagesArray = await this.chatMessagesRepository.findChatMsgByChatId(findChat.id);

    const message = messagesArray.map((msg) => {
      return {
        id: msg.id,
        roomId: msg.chatRoom.id,
        content: msg.content,
        senderId: msg.sender.id,
        senderNickname: msg.sender.nickname,
        createdAt: moment(msg.createdAt).format("YYYY-MM-DD HH:mm:ss"),
      };
    });

    const chatUserData = {
      id: findChat.id,
      matchId: findChat.matchId,
      chatStatus: findChat.status,
      message,
      chathUserId,
      chatUserNickname: opponentUser.nickname,
      preSignedUrl,
    };

    let chatTime = findChat.status === ChatState.PENDING ? expireTime : disconnectTime;

    return {
      chatUserData,
      chatTime,
    };
  }

  async openChatRoom(chatId: number, req: UserRequestDto) {
    const loggedId = req.user.id;
    const findChat = await this.recognizeService.verifyFindChatRoom(chatId, loggedId);

    if (findChat.status === ChatState.OPEN) {
      throw new BadRequestException("이미 해당 채팅방은 오픈이 되어 있는 상태입니다.");
    } else if (
      findChat.status === ChatState.DISCONNECT_END ||
      findChat.status === ChatState.EXPIRE_END ||
      findChat.status === ChatState.RECEIVER_EXIT ||
      findChat.status === ChatState.SENDER_EXIT
    ) {
      throw new BadRequestException(`채팅방 상태가 ${findChat.status} 상태이므로 오픈 할 수 없는 상태입니다.`);
    }

    //과금 처리

    try {
      const openStatusChatRoom = await this.chatTimerService.setChatRoomDisconnectTimer(findChat.matchId);

      return {
        chatId: openStatusChatRoom.id,
        matchId: openStatusChatRoom.matchId,
        chatStatus: openStatusChatRoom.status,
        disconnectTime: openStatusChatRoom.disconnectTime,
      };
    } catch (e) {
      console.error("openChatRoom :", e);
      throw new BadRequestException("채팅방 오픈에 실패했습니다.");
    }
  }

  async exitChatRoom(chatId: number, req: UserRequestDto) {
    const loggedId = req.user.id;
    const currentUser = await this.usersRepository.findOneById(loggedId);
    const chat = await this.recognizeService.verifyFindChatRoom(chatId, currentUser.id);

    if (chat.status === ChatState.SENDER_EXIT || chat.status === ChatState.RECEIVER_EXIT) {
      throw new BadRequestException("이미 나간 채팅방 입니다.");
    }
    //dev에도 반영해줘야 할듯
    try {
      currentUser.id === chat.senderId
        ? (chat.status = ChatState.SENDER_EXIT)
        : (chat.status = ChatState.RECEIVER_EXIT);

      await this.chatsRepository.saveChatData(chat);

      return {
        message: `nickname : ${currentUser.nickname} 유저가 채팅방을 나가 chatId : ${chatId}번  채팅이 종료 되었습니다. `,
      };
    } catch (e) {
      console.error("exitChatRoom :", e);
      throw new BadRequestException("채팅방 나가는 도중 문제가 발생했습니다.");
    }
  }

  async deleteChatRoom(chatId: number, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.recognizeService.validateUser(loggedId);
    const chat = await this.recognizeService.verifyFindChatRoom(chatId, user.id);
    try {
      await this.chatService.removeUserChatRoom(chat.id);

      return {
        message: `matchId : ${chat.matchId}번으로 이루어진 chatId: ${chat.id}번이 삭제 되었습니다.`,
      };
    } catch (e) {
      console.error("deleteChatRoom :", e);
      throw new BadRequestException("채팅방 삭제에 실패했습니다.");
    }
  }
}