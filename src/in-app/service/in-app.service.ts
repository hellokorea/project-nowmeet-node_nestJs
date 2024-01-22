import { Injectable } from "@nestjs/common";
import { UsersRepository } from "src/users/users.repository";

@Injectable()
export class InAppService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getProfile() {
    return "getProfile";
  }
  async sendLike() {
    return "sendLike";
  }
  async openChat() {
    return "openChat";
  }
}

//연달아 2개의 api를 할 것인지 아니면 기존 비즈니스 로직에 과금을 넣을 것인지?
//기존 로직에 추가한다면 젬을 소비하는 과금 로직을 인스펙터로 만들어서 데코레이터 해도 괜찮을듯?
