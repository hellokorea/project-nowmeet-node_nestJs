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
