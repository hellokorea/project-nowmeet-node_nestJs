import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { MatchRepository } from "../database/repository/match.repository";
import { UserRequestDto } from "src/users/dtos/request/users.request.dto";
import { UsersRepository } from "../../users/database/repository/users.repository";
import { MatchState } from "../database/entity/match.entity";
import { RecognizeService } from "src/recognize/recognize.service";
import { ChatService } from "./../../chat/service/chat.service";
import { ChatsRepository } from "./../../chat/database/repository/chat.repository";

@Injectable()
export class MatchService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly usersRepository: UsersRepository,
    private readonly chatsRepository: ChatsRepository,
    private readonly chatService: ChatService,
    private readonly recognizeService: RecognizeService
  ) {}

  async sendLike(receiverNickname: string, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.recognizeService.validateUser(loggedId);

    const oppUser = await this.usersRepository.findOneByNickname(receiverNickname);

    if (!oppUser) {
      throw new NotFoundException("상대방은 존재하지 않는 유저 입니다");
    }

    const receiverId = oppUser.id;

    if (receiverId === loggedId) {
      throw new BadRequestException("본인에게 좋아요를 보낼 수 없습니다");
    }

    const isMatched = await this.matchRepository.isMatchFind(loggedId, receiverId);
    const isChats = await this.chatsRepository.findChatsByUserIds(loggedId, receiverId);
    const findActiveChat = isChats.find((v) => v.status === "OPEN" || v.status === "PENDING");

    if (isMatched.length > 0 || findActiveChat) {
      throw new BadRequestException(`이미 userId.${oppUser.id}번 상대방 유저에게 좋아요를 보냈습니다`);
    }

    await this.matchRepository.createDevMatch(loggedId, receiverId); //Dev

    const newMatchData = await this.matchRepository.createMatch(loggedId, receiverId);

    console.log(user.nickname);
    return {
      matchId: newMatchData.id,
      me: newMatchData.sender.id,
      myNickname: user.nickname,
      receiverId: newMatchData.receiver.id,
      receiverNickname: receiverNickname,
      matchStatus: newMatchData.status,
    };
  }

  // Matching Common Logic
  private async updateMatchStatus(matchId: number, req: UserRequestDto, newStatus: MatchState) {
    const loggedId = req.user.id;
    await this.recognizeService.validateUser(loggedId);

    const devMatch = await this.matchRepository.findOneDevMatchById(matchId); //Dev
    const match = await this.matchRepository.findOneMatchById(matchId);

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
      senderNickname: result.sender.nickname,
      myNickname: result.receiver.nickname,
      receiverId: result.receiver.id,
    };
  }
  //--

  async matchAccept(matchId: number, req: UserRequestDto) {
    const updateMatch = await this.updateMatchStatus(matchId, req, MatchState.MATCH);

    const chatRoom = await this.chatService.createChatRoom(
      updateMatch.matchId,
      updateMatch.senderId,
      updateMatch.receiverId
    );

    const acceptUpdateMatch = {
      matchStatus: updateMatch.matchStatus,
      senderId: updateMatch.senderId,
      senderNickname: updateMatch.senderNickname,
      myNickname: updateMatch.myNickname,
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
}
