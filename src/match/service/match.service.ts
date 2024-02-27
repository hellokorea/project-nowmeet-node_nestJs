import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MatchRepository } from "../match.repository";
import { UserRequestDto } from "src/users/dtos/request/users.request.dto";
import { UsersRepository } from "./../../users/users.repository";
import { UserProfileResponseDto } from "src/users/dtos/response/user.profile.dto";
import { MatchState } from "../entity/match.entity";
import * as moment from "moment";
import { ChatGateway } from "src/chat/chat.gateway";
import { AwsService } from "src/aws.service";
import { ChatState } from "src/chat/entity/chats.entity";
import { UsersService } from "src/users/service/users.service";

@Injectable()
export class MatchService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly usersRepository: UsersRepository,
    private readonly chatGateway: ChatGateway,
    private readonly usersService: UsersService,
    private readonly awsService: AwsService
  ) {}

  //-----Get Profile Logic
  async getUserProfile(nickname: string, req: UserRequestDto) {
    const loggedId = req.user.id;
    await this.usersService.validateUser(loggedId);

    const oppUser = await this.usersRepository.findByNickname(nickname);

    if (!oppUser) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    const oppUserId = oppUser.id;

    if (oppUser.id === loggedId) {
      throw new BadRequestException("본인 프로필 조회 불가");
    }

    //Return User Profile
    const userInfo = new UserProfileResponseDto(oppUser);
    const oppUserMatchStatus = await this.getMatchStatus(oppUserId, loggedId);
    const preSignedUrl = await this.awsService.createPreSignedUrl(oppUser.profileImages);

    return {
      user: userInfo,
      matchStatus: oppUserMatchStatus,
      PreSignedUrl: preSignedUrl,
    };
  }

  //-----Get Match Status Common
  async getMatchStatus(oppUserId: number, loggedId: number) {
    const isMatch = await this.matchRepository.findMatchByUserIds(oppUserId, loggedId);
    const isChats = await this.chatGateway.findChatsByUserIds(oppUserId, loggedId);

    let matchStatus = isMatch ? isMatch.status : null;

    if (!matchStatus) {
      const openOrPendingChat = isChats.find((v) => v.status === ChatState.OPEN || v.status === ChatState.PENDING);

      if (openOrPendingChat) {
        matchStatus = MatchState.MATCH;
      }
    }
    return matchStatus;
  }

  //-----Create Match Logic
  async sendLike(receiverNickname: string, req: UserRequestDto) {
    const loggedId = req.user.id;
    await this.usersService.validateUser(loggedId);

    const oppUser = await this.usersRepository.findByNickname(receiverNickname);

    if (!oppUser) {
      throw new NotFoundException("상대방은 존재하지 않는 유저 입니다");
    }

    const receiverId = oppUser.id;

    if (receiverId === loggedId) {
      throw new BadRequestException("본인에게 좋아요를 보낼 수 없습니다");
    }

    const isMatched = await this.matchRepository.isMatchFind(loggedId, receiverId);
    const isChats = await this.chatGateway.findChatsByUserIds(loggedId, receiverId);
    const findActiveChat = isChats.find((v) => v.status === "OPEN" || v.status === "PENDING");

    if (isMatched.length > 0 || findActiveChat) {
      throw new BadRequestException(`이미 userId.${oppUser.id}번 상대방 유저에게 좋아요를 보냈습니다`);
    }

    await this.matchRepository.createDevMatch(loggedId, receiverId); //Dev

    const newMatchData = await this.matchRepository.createMatch(loggedId, receiverId);

    return {
      matchId: newMatchData.id,
      me: newMatchData.sender.id,
      receiverId: newMatchData.receiver.id,
      receiverNickname: receiverNickname,
      matchStatus: newMatchData.status,
    };
  }

  //Matching Common Logic
  private async updateMatchStatus(matchId: number, req: UserRequestDto, newStatus: MatchState) {
    const loggedId = req.user.id;
    await this.usersService.validateUser(loggedId);

    const devMatch = await this.matchRepository.findDevMatchById(matchId); //Dev
    const match = await this.matchRepository.findMatchById(matchId);

    if (!match) {
      throw new NotFoundException("매치가 존재하지 않습니다");
    }

    if (match.receiver.id === null || match.sender.id === null) {
      throw new NotFoundException("해당 유저가 존재하지 않습니다");
    }

    if (match.receiver.id !== loggedId) {
      throw new BadRequestException("유저 정보가 일치하지 않습니다");
    }

    devMatch.status = newStatus; //Dev
    await this.matchRepository.saveDevMatch(devMatch); //Dev

    match.status = newStatus;
    const result = await this.matchRepository.saveMatch(match);

    return {
      matchId: result.id,
      matchStatus: result.status,
      senderId: result.sender.id,
      receiverId: result.receiver.id,
    };
  }
  //--

  async matchAccept(matchId: number, req: UserRequestDto) {
    const updateMatch = await this.updateMatchStatus(matchId, req, MatchState.MATCH);

    const chatRoom = await this.chatGateway.createChatRoom(
      updateMatch.matchId,
      updateMatch.senderId,
      updateMatch.receiverId
    );

    const acceptUpdateMatch = {
      matchStatus: updateMatch.matchStatus,
      senderId: updateMatch.senderId,
    };

    const returnChatRoom = {
      chatRoomId: chatRoom.id,
      chatStatus: chatRoom.status,
      matchId: chatRoom.matchId,
    };

    return {
      match: acceptUpdateMatch,
      chatRoom: returnChatRoom,
    };
  }

  async matchReject(matchId: number, req: UserRequestDto) {
    const updateMatch = await this.updateMatchStatus(matchId, req, MatchState.REJECT);

    const rejectUpdateMatch = {
      matchStatus: updateMatch.matchStatus,
      senderId: updateMatch.senderId,
    };

    return {
      match: rejectUpdateMatch,
    };
  }

  //-----Get Match Box Logic
  async getLikeSendBox(req: UserRequestDto) {
    const loggedId = req.user.id;
    await this.usersService.validateUser(loggedId);

    const matched = await this.matchRepository.getSendMatch(loggedId);

    if (!matched.length) {
      return null;
    }
    const receiverProfiles = matched.map((data) => data.receiver.profileImages);
    const preSignedUrl = await this.awsService.createPreSignedUrl(receiverProfiles.flat());

    const sendBox = matched
      .filter((matchData) => matchData.status !== MatchState.MATCH && matchData.status !== MatchState.EXPIRE)
      .map((matchData) => ({
        matchId: matchData.id,
        matchStatus: matchData.status,
        receiverId: matchData.receiver.id,
        receiverNickname: matchData.receiver.nickname,
        expireMatch: moment(matchData.expireMatch).format("YYYY-MM-DD HH:mm:ss"),
        profileImages: {
          ProfileImages: matchData.receiver.profileImages,
          PreSignedUrl: preSignedUrl,
        },
      }));

    if (!sendBox.length) {
      return null;
    }

    return sendBox;
  }

  async getLikeReceiveBox(req: UserRequestDto) {
    const loggedId = req.user.id;
    await this.usersService.validateUser(loggedId);

    const matched = await this.matchRepository.getReceiveMatch(loggedId);

    if (!matched.length) {
      return null;
    }

    const senderProfiles = matched.map((data) => data.sender.profileImages);
    const preSignedUrl = await this.awsService.createPreSignedUrl(senderProfiles.flat());

    const receiveBox = matched
      .filter((matchData) => matchData.status === MatchState.PENDING)
      .map((matchData) => ({
        matchId: matchData.id,
        matchStatus: matchData.status,
        senderId: matchData.sender.id,
        senderNickname: matchData.sender.nickname,
        expireMatch: moment(matchData.expireMatch).format("YYYY-MM-DD HH:mm:ss"),
        profileImages: {
          ProfileImages: matchData.sender.profileImages,
          PreSignedUrl: preSignedUrl,
        },
      }));

    if (!receiveBox.length) {
      return null;
    }

    return receiveBox;
  }

  //-----Match Delete Logic
  async removeExpireMatches() {
    try {
      const expireMatches = await this.matchRepository.findExpiredMatches();

      if (!expireMatches.length) {
        console.log("삭제 할 매치 데이터가 존재하지 않습니다.");
        return;
      }

      expireMatches.forEach(async (match) => {
        console.log(`삭제된 matchId: ${match.id}, matchStatus: ${match.status} ... match data remove`);
        await this.matchRepository.removeExpireMatch(match);
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException("매칭 삭제 도중 문제가 발생했습니다.");
    }
  }

  //*--------------------------------------Chat Logic

  //Find Chat Common Exception
  async verifyFindChatRoom(chatId: number, loggedId: number) {
    const user = await this.usersRepository.findById(loggedId);

    if (!user) {
      throw new NotFoundException("해당 유저가 존재하지 않습니다");
    }
    const findChat = await this.chatGateway.findOneChatRoomsByChatId(chatId);

    if (!findChat) {
      throw new NotFoundException("해당 채팅방이 존재하지 않습니다");
    }

    if (findChat.receiverId === null || findChat.senderId === null) {
      throw new NotFoundException("상대방 유저가 존재하지 않습니다");
    }

    const isUser = await this.chatGateway.findChatsByUserId(loggedId);

    if (!isUser.length) {
      throw new BadRequestException("채팅방 내 유저 정보가 존재하지 않습니다");
    }

    return findChat;
  }
  //--

  async getChatRoomsAllList(req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.usersService.validateUser(loggedId);

    const findChats = await this.chatGateway.findChatsByUserId(user.id);

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

      const oppUser = await this.usersRepository.findById(matchUserId);
      const preSignedUrl = await this.awsService.createPreSignedUrl(oppUser.profileImages);

      let lastMessageData = await this.chatGateway.findOneLastMessage(chat.id);

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
        chatStatus: chat.status, //profileImg decide
        preSignedUrl,
      };
    });

    const chatList = await Promise.all(chatListPromises);

    return chatList;
  }

  async getUserChatRoom(chatId: number, req: UserRequestDto) {
    const loggedId = req.user.id;
    const findChat = await this.verifyFindChatRoom(chatId, loggedId);

    let chathUserId: number;

    loggedId === findChat.receiverId ? (chathUserId = findChat.senderId) : (chathUserId = findChat.receiverId);

    const opponentUser = await this.usersRepository.findById(chathUserId);
    const preSignedUrl = await this.awsService.createPreSignedUrl(opponentUser.profileImages);
    const expireTime = moment(findChat.expireTime).format("YYYY-MM-DD HH:mm:ss");
    const disconnectTime = moment(findChat.disconnectTime).format("YYYY-MM-DD HH:mm:ss");
    const messagesArray = await this.chatGateway.findChatMsgByChatId(findChat.id);

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

    // const messageCombineData = await this.chatGateway.combineMessageToClient(messagesArray, findChat.status);

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
    const findChat = await this.verifyFindChatRoom(chatId, loggedId);

    if (findChat.status === ChatState.OPEN) {
      throw new BadRequestException("이미 해당 채팅방은 오픈이 되어 있는 상태입니다.");
    } else if (
      findChat.status === ChatState.DISCONNECT_END ||
      findChat.status === ChatState.EXIPRE_END ||
      findChat.status === ChatState.RECEIVER_EXIT ||
      findChat.status === ChatState.SENDER_EXIT
    ) {
      throw new BadRequestException(`채팅방 상태가 ${findChat.status} 상태이므로 오픈 할 수 없는 상태입니다.`);
    }

    //과금 처리

    try {
      const openStatusChatRoom = await this.chatGateway.setChatRoomDisconnectTimer(findChat.matchId);

      return {
        chatId: openStatusChatRoom.id,
        matchId: openStatusChatRoom.matchId,
        chatStatus: openStatusChatRoom.status,
        disconnectTime: openStatusChatRoom.disconnectTime,
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException("채팅방 오픈에 실패했습니다.");
    }
  }

  async exitChatRoom(chatId: number, req: UserRequestDto) {
    const loggedId = req.user.id;
    const currentUser = await this.usersRepository.findById(loggedId);
    const chat = await this.verifyFindChatRoom(chatId, currentUser.id);

    if (chat.status === ChatState.SENDER_EXIT || chat.status === ChatState.RECEIVER_EXIT) {
      throw new BadRequestException("이미 나간 채팅방 입니다.");
    }

    try {
      currentUser.id === chat.senderId
        ? (chat.status = ChatState.SENDER_EXIT)
        : (chat.status = ChatState.RECEIVER_EXIT);

      await this.chatGateway.saveChatData(chat);

      return {
        message: `nickname : ${currentUser.nickname} 유저가 채팅방을 나가 chatId : ${chatId}번  채팅이 종료 되었습니다. `,
      };
    } catch (e) {
      console.error(e);
      throw new BadRequestException("채팅방 나가는 도중 문제가 발생했습니다.");
    }
  }

  async deleteChatRoom(chatId: number, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.usersService.validateUser(loggedId);
    const chat = await this.verifyFindChatRoom(chatId, user.id);
    try {
      await this.chatGateway.removeUserChatRoom(chat.id);

      return {
        message: `matchId : ${chat.matchId}번으로 이루어진 chatId: ${chat.id}번이 삭제 되었습니다.`,
      };
    } catch (err) {
      console.error(err);
      throw new BadRequestException("채팅방 삭제에 실패했습니다.");
    }
  }
}
