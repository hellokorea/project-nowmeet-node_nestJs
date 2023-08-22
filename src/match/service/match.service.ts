import { Injectable, UnauthorizedException } from "@nestjs/common";
import { MatchRepository } from "../match.repository";
import { UserRequestDto } from "src/users/dtos/users.request.dto";
import { UsersRepository } from "./../../users/users.repository";
import { UserProfileResponseDto } from "src/users/dtos/user.profile.dto";
import { User } from "src/users/entity/users.entity";
import { MatchState } from "../entity/match.entity";
import * as moment from "moment";
import { ChatGateway } from "src/chat/chat.gateway";

@Injectable()
export class MatchService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly usersRepository: UsersRepository,
    private readonly chatGateway: ChatGateway
  ) {}

  async getUserProfile(profileId: number, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.usersRepository.findById(profileId);

    if (!user) {
      throw new UnauthorizedException("존재하지 않는 유저 입니다");
    }

    if (user.id === loggedId) {
      throw new UnauthorizedException("본인 프로필 조회 불가");
    }

    const isMatch = await this.matchRepository.findMatchByUserIds(profileId, loggedId);
    const isChats = await this.chatGateway.findChatsByUserIds(profileId, loggedId);

    const userInfo = new UserProfileResponseDto(user);

    let matchStatus = null;

    if (isMatch) {
      matchStatus = isMatch.status;
    } else if (isChats) {
      matchStatus = MatchState.MATCH;
    }

    return {
      user: userInfo,
      matchStatus: matchStatus,
    };
  }

  async sendLike(receiverId: number, req: UserRequestDto) {
    const senderId = req.user.id;

    const user = await this.usersRepository.findById(receiverId);

    if (!user) {
      throw new UnauthorizedException("존재하지 않는 유저 입니다");
    }

    if (receiverId === senderId) {
      throw new UnauthorizedException("본인에게 좋아요를 보낼 수 없습니다");
    }

    const isMatched = await this.matchRepository.isMatchFind(senderId, receiverId);

    if (isMatched.length > 0) {
      throw new UnauthorizedException(`이미 userId.${user.id}번 유저에게 좋아요를 보냈습니다`);
    } else {
      await this.matchRepository.createDevMatch(senderId, receiverId); //dev
      const newMatchData = await this.matchRepository.createMatch(senderId, receiverId);
      return {
        matchId: newMatchData.id,
        senderId: newMatchData.sender.id,
        receiverId: newMatchData.receiver.id,
        matchStatus: newMatchData.status,
      };
    }
  }

  async getLikeSendBox(req: UserRequestDto) {
    const loggedId = req.user.id;
    const matched = await this.matchRepository.getSendMatch(loggedId);

    const sendBox = matched
      .filter((matchData) => matchData.status === MatchState.PENDING || MatchState.REJECT)
      .map((matchData) => ({
        matchId: matchData.id,
        isMatch: matchData.status,
        receiverId: matchData.receiver.id,
        expireMatch: moment(matchData.expireMatch).format("YYYY-MM-DD HH:mm:ss"),
      }));

    if (!sendBox.length) {
      return null;
    }

    return sendBox;
  }

  async getLikeReceiveBox(req: UserRequestDto) {
    const loggedId = req.user.id;
    const matched = await this.matchRepository.getReceiveMatch(loggedId);

    const receiveBox = matched
      .filter((matchData) => matchData.status === MatchState.PENDING)
      .map((matchData) => ({
        matchId: matchData.id,
        isMatch: matchData.status,
        senderId: matchData.sender.id,
        expireMatch: moment(matchData.expireMatch).format("YYYY-MM-DD HH:mm:ss"),
      }));

    if (!receiveBox.length) {
      return null;
    }

    return receiveBox;
  }

  // 매칭 공용 함수
  private async updateMatchStatus(matchId: number, req: UserRequestDto, newStatus: MatchState) {
    const loggedId = req.user.id;

    const devMatch = await this.matchRepository.findDevMatchById(matchId); //dev
    const match = await this.matchRepository.findMatchById(matchId);

    if (!match) {
      throw new UnauthorizedException("매치가 존재하지 않습니다");
    }

    if (match.receiver.id !== loggedId) {
      throw new UnauthorizedException("유저 정보가 일치하지 않습니다");
    }

    devMatch.status = newStatus; //dev
    await this.matchRepository.saveDevMatch(devMatch); //dev

    match.status = newStatus;
    const result = await this.matchRepository.saveMatch(match);

    return {
      matchId: result.id,
      matchStatus: result.status,
      senderId: result.sender.id,
      receiverId: result.receiver.id,
    };
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
    const expireMatches = await this.matchRepository.findExpireMatchesById();
    expireMatches.forEach(async (match) => {
      console.log(`matchId: ${match.id}, matchStatus: ${match.status} ... match data remove`);
      await this.matchRepository.removeExpireMatch(match);
    });
  }

  /*
  ^^--------------------------------------Chat Rogic
  */

  async getChatRommsList(req: UserRequestDto) {
    const loggedId = req.user.id;

    const findChats = await this.chatGateway.findChatsByUserId(loggedId);

    if (!findChats.length) {
      return null;
    }

    return findChats;
  }

  async getUserChatRoom(chatId: number, req: UserRequestDto) {
    const loggedId = req.user.id;

    const findChat = await this.chatGateway.findChatRoomsByChatId(chatId);

    if (!findChat) {
      throw new UnauthorizedException("해당 채팅방이 존재하지 않습니다");
    }

    const isUser = await this.chatGateway.findChatsByUserId(loggedId);

    if (!isUser.length) {
      throw new UnauthorizedException("유저 정보가 올바르지 않습니다");
    }

    let user: number;

    if (loggedId === findChat.receiverId) {
      user = findChat.senderId;
    } else if (loggedId === findChat.senderId) {
      user = findChat.receiverId;
    }

    return {
      chatId: findChat.id,
      matchedUserId: user,
      chatStatus: findChat.status,
      matchId: findChat.matchId,
    };
  }
}
