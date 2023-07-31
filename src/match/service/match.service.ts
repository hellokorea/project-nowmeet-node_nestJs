import { Injectable, UnauthorizedException } from "@nestjs/common";
import { MatchRepository } from "../match.repository";
import { UserRequestDto } from "src/users/dtos/users.request.dto";
import { UsersRepository } from "./../../users/users.repository";
import { UserProfileResponseDto } from "src/users/dtos/user.profile.dto";
import { User } from "src/users/entity/users.entity";

@Injectable()
export class MatchService {
  constructor(private readonly matchRepository: MatchRepository, private readonly usersRepository: UsersRepository) {}

  async getUserProfile(id: number) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new UnauthorizedException("존재하지 않는 유저 입니다");
    }

    return new UserProfileResponseDto(user);
  }

  async createMatch(receiverId: number, req: UserRequestDto) {
    const senderId = req.user.id;

    const user = await this.usersRepository.findById(receiverId);
    console.log(`좋아요 보낸 유저: ${senderId}`);
    console.log(`좋아요 받은 유저: ${receiverId}`);

    if (!user) {
      throw new UnauthorizedException("존재하지 않는 유저 입니다");
    }

    return await this.matchRepository.createMatch(senderId, receiverId);
  }

  async getLikeSendBox(req: UserRequestDto) {
    const usersId = req.user.id;
    const matched = await this.matchRepository.getSendMatch(usersId);
    console.log(matched);
    return matched.map((matchResult) => ({
      id: matchResult.id,
      isMatch: matchResult.accepted,
      receiver: matchResult.receiver.id,
    }));
  }
}
