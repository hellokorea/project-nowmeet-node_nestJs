import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Match } from "./entity/match.entity";
import { FindOneOptions, Repository } from "typeorm";

@Injectable()
export class MatchRepository {
  constructor(@InjectRepository(Match) private matchRepository: Repository<Match>) {}

  async createMatch(senderId: number, receiverId: number): Promise<Match> {
    const newMatch = this.matchRepository.create({
      sender: { id: senderId },
      receiver: { id: receiverId },
      accepted: false,
    });

    return await this.matchRepository.save(newMatch);
  }

  async getSendMatch(senderId: number): Promise<Match[]> {
    return await this.matchRepository.find({ where: { sender: { id: senderId } }, relations: ["receiver"] });
  }
}
