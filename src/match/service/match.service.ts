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

@Injectable()
export class MatchService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly usersRepository: UsersRepository,
    private readonly chatGateway: ChatGateway,
    private readonly awsService: AwsService
  ) {}

  async getUserProfile(nickname: string, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.usersRepository.findByNickname(nickname);

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    const profiledId = user.id;
    console.log("object");
    if (user.id === loggedId) {
      throw new BadRequestException("본인 프로필 조회 불가");
    }

    const isMatch = await this.matchRepository.findMatchByUserIds(profiledId, loggedId);
    const isChats = await this.chatGateway.findChatsByUserIds(profiledId, loggedId);

    const userInfo = new UserProfileResponseDto(user);

    let matchStatus = null;

    if (isMatch) {
      matchStatus = isMatch.status;
    } else if (isChats) {
      matchStatus = MatchState.MATCH;
    }

    const preSignedUrl = await this.awsService.createPreSignedUrl(user.profileImages);

    return {
      user: userInfo,
      matchStatus: matchStatus,
      PreSignedUrl: preSignedUrl,
    };
  }

  async getLikeSendBox(req: UserRequestDto) {
    const loggedId = req.user.id;
    const matched = await this.matchRepository.getSendMatch(loggedId);
    const receiverProfiles = matched.map((data) => data.receiver.profileImages);
    const preSignedUrl = await this.awsService.createPreSignedUrl(receiverProfiles.flat());

    const sendBox = matched.map((matchData) => ({
      matchId: matchData.id,
      isMatch: matchData.status,
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
    const matched = await this.matchRepository.getReceiveMatch(loggedId);
    const senderProfiles = matched.map((data) => data.sender.profileImages);
    const preSignedUrl = await this.awsService.createPreSignedUrl(senderProfiles.flat());

    const receiveBox = matched
      .filter((matchData) => matchData.status === MatchState.PENDING)
      .map((matchData) => ({
        matchId: matchData.id,
        isMatch: matchData.status,
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

  // 매칭 공용 함수
  private async updateMatchStatus(matchId: number, req: UserRequestDto, newStatus: MatchState) {
    const loggedId = req.user.id;

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

  async sendLike(receiverNickname: string, req: UserRequestDto) {
    const loggedId = req.user.id;

    const user = await this.usersRepository.findByNickname(receiverNickname);

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    const receiverId = user.id;

    if (receiverId === loggedId) {
      throw new BadRequestException("본인에게 좋아요를 보낼 수 없습니다");
    }

    const isMatched = await this.matchRepository.isMatchFind(loggedId, receiverId);

    if (isMatched.length > 0) {
      throw new BadRequestException(`이미 userId.${user.id}번 유저에게 좋아요를 보냈습니다`);
    } else {
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
  }

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

  async removeExpireMatches() {
    try {
      const expireMatches = await this.matchRepository.findExpireMatchesById();

      expireMatches.forEach(async (match) => {
        console.log(`삭제된 matchId: ${match.id}, matchStatus: ${match.status} ... match data remove`);
        await this.matchRepository.removeExpireMatch(match);
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException("매칭 삭제 도중 문제가 발생했습니다.");
    }
  }

  /*
  ^^--------------------------------------Chat Rogic
  */

  async getChatRoomsAllList(req: UserRequestDto) {
    const loggedId = req.user.id;

    const findChats = await this.chatGateway.findChatsByUserId(loggedId);

    if (!findChats.length) {
      return null;
    }

    const chatListPromises = findChats.map(async (chat) => {
      let me: number;
      let matchUserId: number;

      if (loggedId === chat.receiverId || loggedId === chat.senderId) {
        me = loggedId;
        matchUserId = loggedId === chat.receiverId ? chat.senderId : chat.receiverId;
      } else {
        throw new BadRequestException();
      }

      const userInfo = await this.usersRepository.findById(matchUserId);
      const preSignedUrl = await this.awsService.createPreSignedUrl(userInfo.profileImages);
      //논리적 삭제 여부 노출?
      return {
        chatId: chat.id,
        matchId: chat.matchId,
        me,
        matchUserId,
        matchUserNickname: userInfo.nickname,
        profileImage: preSignedUrl[0],
      };
    });

    const chatList = await Promise.all(chatListPromises);

    return chatList;
  }

  async getUserChatRoom(chatId: number, req: UserRequestDto) {
    const loggedId = req.user.id;

    const findChat = await this.chatGateway.findChatRoomsByChatId(chatId);

    if (!findChat) {
      throw new NotFoundException("해당 채팅방이 존재하지 않습니다");
    }

    if (findChat.receiverId === null || findChat.senderId === null) {
      throw new NotFoundException("해당 유저가 존재하지 않습니다");
    }

    const isUser = await this.chatGateway.findChatsByUserId(loggedId);

    if (!isUser.length) {
      throw new BadRequestException("유저 정보가 올바르지 않습니다");
    }

    let matchUserId: number;

    if (loggedId === findChat.receiverId) {
      matchUserId = findChat.senderId;
    } else if (loggedId === findChat.senderId) {
      matchUserId = findChat.receiverId;
    }

    const userInfo = await this.usersRepository.findById(matchUserId);
    const preSignedUrl = await this.awsService.createPreSignedUrl(userInfo.profileImages);
    const expireTime = moment(findChat.expireTime).format("YYYY-MM-DD HH:mm:ss");
    const disconnectTime = moment(findChat.disconnectTime).format("YYYY-MM-DD HH:mm:ss");

    const chatData = {
      chatId: findChat.id,
      matchId: findChat.matchId,
      matchUserId,
      matchUserNickname: userInfo.nickname,
      chatStatus: findChat.status,
      profileImage: preSignedUrl[0],
    };

    if (findChat.status === "PENDING") {
      return {
        chatData,
        expireTime,
      };
    } else if (findChat.status === "OPEN") {
      return {
        chatData,
        disconnectTime,
      };
    }
  }

  async openChatRoom(chatId: number, req: UserRequestDto) {
    const loggedId = req.user.id;

    const findChat = await this.chatGateway.findChatRoomsByChatId(chatId);

    if (!findChat) {
      throw new NotFoundException("해당 채팅방이 존재하지 않습니다");
    }

    if (findChat.receiverId === null || findChat.senderId === null) {
      throw new NotFoundException("해당 유저가 존재하지 않습니다");
    }

    const isUser = await this.chatGateway.findChatsByUserId(loggedId);

    if (!isUser.length) {
      throw new BadRequestException("유저 정보가 올바르지 않습니다");
    }

    //과금 처리

    const openChatActive = await this.chatGateway.setChatRoomDisconnectTimer(findChat.matchId);
    const disconnectTime = moment(openChatActive.disconnectTime).format("YYYY-MM-DD HH:mm:ss");

    return {
      chatStatus: openChatActive.status,
      disconnectTime,
    };
  }
}
