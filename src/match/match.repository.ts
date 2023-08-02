import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Match } from "./entity/match.entity";
import { FindOneOptions, LessThan, Repository } from "typeorm";

@Injectable()
export class MatchRepository {
  constructor(@InjectRepository(Match) private matchRepository: Repository<Match>) {}

  async createMatch(senderId: number, receiverId: number): Promise<Match> {
    const CHECK_CYCLE: number = 24 * 60 * 60 * 1000;
    const TEST_CYCLE: number = 10 * 1000;

    const newMatch = this.matchRepository.create({
      sender: { id: senderId },
      receiver: { id: receiverId },
      expireMatch: new Date(Date.now() + CHECK_CYCLE),
    });

    return await this.matchRepository.save(newMatch);
  }

  async getSendMatch(userId: number): Promise<Match[]> {
    return await this.matchRepository.find({ where: { sender: { id: userId } }, relations: ["receiver"] });
  }

  async getReceiveMatch(userId: number): Promise<Match[]> {
    return await this.matchRepository.find({ where: { receiver: { id: userId } }, relations: ["sender"] });
  }

  async isMatchFind(senderId: number, receiverId: number): Promise<Match[]> {
    return await this.matchRepository.find({
      where: {
        sender: { id: senderId },
        receiver: { id: receiverId },
      },
    });
  }

  async findMatchById(matchId: number): Promise<Match> {
    const option: FindOneOptions<Match> = {
      where: { id: matchId },
      relations: ["receiver", "sender"],
    };

    return await this.matchRepository.findOne(option);
  }

  async saveMatch(match: Match): Promise<Match> {
    return await this.matchRepository.save(match);
  }

  async findExpireMatchesById(): Promise<Match[]> {
    return this.matchRepository.find({ where: { expireMatch: LessThan(new Date()) } });
  }

  async removeExpireMatch(match: Match) {
    await this.matchRepository.remove(match);
  }
}
