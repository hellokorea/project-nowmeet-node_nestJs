import { Injectable, UnauthorizedException } from "@nestjs/common";
import { MatchRepository } from "../match.repository";
import { UserRequestDto } from "src/users/dtos/users.request.dto";
import { UsersRepository } from "./../../users/users.repository";
import { UserProfileResponseDto } from "src/users/dtos/user.profile.dto";
import { User } from "src/users/entity/users.entity";
import { MatchState } from "../entity/match.entity";

@Injectable()
export class MatchService {
  constructor(private readonly matchRepository: MatchRepository, private readonly usersRepository: UsersRepository) {}

  async getUserProfile(id: number) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new UnauthorizedException("존재하지 않는 유저 입니다");
    }

    const isMatchState = await this.matchRepository.findMatchByUserId(id);
    const userInfo = new UserProfileResponseDto(user);

    return {
      user: userInfo,
      matchStatus: isMatchState ? isMatchState.status : null,
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
      return { matchId: isMatched[0]["id"], matchStatus: isMatched[0]["status"] };
    } else {
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
    const usersId = req.user.id;
    const matched = await this.matchRepository.getSendMatch(usersId);

    const sendBox = matched
      .filter((matchData) => matchData.status === MatchState.PENDING)
      .map((matchData) => ({
        matchId: matchData.id,
        isMatch: matchData.status,
        receiverId: matchData.receiver.id,
      }));

    if (!sendBox.length) {
      return null;
    }

    return sendBox;
  }

  async getLikeReceiveBox(req: UserRequestDto) {
    const userId = req.user.id;
    const matched = await this.matchRepository.getReceiveMatch(userId);

    const receiveBox = matched
      .filter((matchData) => matchData.status === MatchState.PENDING)
      .map((matchData) => ({
        matchId: matchData.id,
        isMatch: matchData.status,
        senderId: matchData.sender.id,
      }));

    if (!receiveBox.length) {
      return null;
    }

    return receiveBox;
  }

  // 매칭 공용 함수
  private async updateMatchStatus(matchId: number, req: UserRequestDto, newStatus: MatchState) {
    const userId = req.user.id;

    const match = await this.matchRepository.findMatchById(matchId);

    if (!match) {
      throw new UnauthorizedException("매치가 존재하지 않습니다");
    }

    if (match.receiver.id !== userId) {
      throw new UnauthorizedException("유저 정보가 일치하지 않습니다");
    }

    match.status = newStatus;

    const result = await this.matchRepository.saveMatch(match);

    return { matchStatus: result.status, senderId: result.sender.id };
  }

  async matchAccept(matchId: number, req: UserRequestDto) {
    return this.updateMatchStatus(matchId, req, MatchState.MATCH);
  }

  async matchReject(matchId: number, req: UserRequestDto) {
    return this.updateMatchStatus(matchId, req, MatchState.REJECT);
  }

  async removeExpireMatches() {
    const expireMatches = await this.matchRepository.findExpireMatchesById();
    expireMatches.forEach(async (match) => {
      await this.matchRepository.removeExpireMatch(match);
    });
  }
}
