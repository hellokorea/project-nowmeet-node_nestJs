import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";

@Injectable()
export class UserBlockService {
  private map = new Map<number, Set<number>>();

  constructor() {}

  async createBlockUser(loggedId: number, oppUserId: number): Promise<Boolean> {
    if (!this.map.has(loggedId)) {
      this.map.set(loggedId, new Set());
    }

    if (!this.map.has(oppUserId)) {
      this.map.set(oppUserId, new Set());
    }

    const loggedIdBlockedSet = this.map.get(loggedId);
    const oppUserIdBlockedSet = this.map.get(oppUserId);

    // 이미 차단된 상태인지 확인
    if (loggedIdBlockedSet.has(oppUserId) && oppUserIdBlockedSet.has(loggedId)) {
      return false; // 이미 양방향 차단된 경우
    }

    try {
      // 양방향으로 차단 관계 설정
      loggedIdBlockedSet.add(oppUserId);
      oppUserIdBlockedSet.add(loggedId);

      console.log("차단 설정 된 ", this.map);
    } catch (e) {
      throw new BadRequestException("잘못된 유저 차단 요청입니다.");
    }

    return true;
  }

  async deleteBlockUser(loggedId: number, oppUserId: number) {
    // const loggedIdBlockedSet = this.map.get(loggedId) || new Set();
    // const oppUserIdBlockedSet = this.map.get(oppUserId) || new Set();
    // try {
    //   if (loggedIdBlockedSet.has(oppUserId) && oppUserIdBlockedSet.has(loggedId)) {
    //     this.map.delete(loggedId);
    //     this.map.delete(oppUserId);
    //     console.log("차단 해제 된 ", this.map);
    //     return true;
    //   } else {
    //     return false;
    //   }
    // } catch (e) {
    //   console.log(e);
    //   throw new InternalServerErrorException("차단 해제 도중 알 수 없는 오류 발생.");
    // }
  }

  async isUserBlocked(loggedId: number, oppUserId: number): Promise<boolean> {
    const loggedIdBlockedSet = this.map.get(loggedId) || new Set();
    const oppUserIdBlockedSet = this.map.get(oppUserId) || new Set();
    return loggedIdBlockedSet.has(oppUserId) && oppUserIdBlockedSet.has(loggedId);
  }
}
