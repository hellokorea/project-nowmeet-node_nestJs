import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Match } from "./entity/match.entity";
import { EntityManager, FindOneOptions, LessThan, Repository } from "typeorm";
import { DevMatch } from "./entity/devmatch.entity";

@Injectable()
export class MatchRepository {
  constructor(
    @InjectRepository(Match) private matchRepository: Repository<Match>,
    @InjectRepository(DevMatch) private devMatchRepository: Repository<DevMatch>
  ) {}

  async createMatch(senderId: number, receiverId: number): Promise<Match> {
    const CHECK_CYCLE: number = 24 * 60 * 60 * 1000;
    const TEST_CYCLE: number = 30 * 1000;

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

  async findMatchByUserIds(profileId: number, loggedId: number): Promise<Match | null> {
    const option: FindOneOptions<Match> = {
      where: [
        { sender: { id: loggedId }, receiver: { id: profileId } },
        { sender: { id: profileId }, receiver: { id: loggedId } },
      ],
    };

    return await this.matchRepository.findOne(option);
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

  async removeExpireMatch(match: Match): Promise<void> {
    await this.matchRepository.remove(match);
  }

  async deleteMatchesByUserId(txManager: EntityManager, userId: number): Promise<void> {
    const matchRepository = txManager.getRepository(Match);
    const matches = await matchRepository.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
    });

    await matchRepository.remove(matches);
  }

  /*
  ^^-------------------------------------내부 DB 보관용 Dev_Match 로직
  */
  async findDevMatchById(matchId: number): Promise<DevMatch> {
    const option: FindOneOptions<DevMatch> = {
      where: { id: matchId },
      relations: ["receiver", "sender"],
    };

    return await this.devMatchRepository.findOne(option);
  }

  async createDevMatch(senderId: number, receiverId: number): Promise<DevMatch> {
    const newMatch = this.devMatchRepository.create({
      sender: { id: senderId },
      receiver: { id: receiverId },
    });

    return await this.devMatchRepository.save(newMatch);
  }

  async saveDevMatch(match: DevMatch): Promise<DevMatch> {
    return await this.devMatchRepository.save(match);
  }

  async deleteDevMatchesByUserId(txManager: EntityManager, userId: number): Promise<void> {
    const devMatchRepository = txManager.getRepository(DevMatch);
    const matches = await devMatchRepository.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
    });

    await devMatchRepository.remove(matches);
  }
}
