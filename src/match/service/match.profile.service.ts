import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from "@nestjs/common";
import { ChatState } from "src/chat/database/entity/chat.entity";
import { UserRequestDto } from "src/users/dtos/request/users.request.dto";
import { UserProfileResponseDto } from "src/users/dtos/response/user.profile.dto";
import { MatchState } from "../database/entity/match.entity";
import { MatchRepository } from "../database/repository/match.repository";
import { AwsService } from "src/aws.service";
import { UsersRepository } from "src/users/database/repository/users.repository";
import { RecognizeService } from "src/recognize/recognize.service";
import { ChatGateway } from "src/chat/gateway/chat.gateway";
import { ChatsRepository } from "./../../chat/database/repository/chat.repository";

@Injectable()
export class MatchProfileService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly matchRepository: MatchRepository,
    private readonly chatsRepository: ChatsRepository,
    private readonly awsService: AwsService,
    private readonly recognizeService: RecognizeService
  ) {}

  async getUserProfile(nickname: string, req: UserRequestDto) {
    const loggedId = req.user.id;
    await this.recognizeService.validateUser(loggedId);

    const oppUser = await this.usersRepository.findOneByNickname(nickname);

    if (!oppUser) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    const oppUserId = oppUser.id;

    if (oppUser.id === loggedId) {
      throw new BadRequestException("본인 프로필 조회 불가");
    }

    const userInfo = new UserProfileResponseDto(oppUser);
    const oppUserMatchStatus = await this.getMatchStatus(oppUserId, loggedId);
    const preSignedUrl = await this.awsService.createPreSignedUrl(oppUser.profileImages);

    return {
      user: userInfo,
      matchStatus: oppUserMatchStatus,
      PreSignedUrl: preSignedUrl,
    };
  }

  async getMatchStatus(oppUserId: number, loggedId: number) {
    const isMatch = await this.matchRepository.findOneMatchByUserIds(oppUserId, loggedId);
    const isChats = await this.chatsRepository.findChatsByUserIds(oppUserId, loggedId);

    let matchStatus = isMatch ? isMatch.status : null;

    if (!matchStatus) {
      const openOrPendingChat = isChats.find((v) => v.status === ChatState.OPEN || v.status === ChatState.PENDING);

      if (openOrPendingChat) {
        matchStatus = MatchState.MATCH;
      }
    }
    return matchStatus;
  }
}
