import { User } from "../entity/users.entity";

export class UserProfileResponseDto {
  nickname: string;
  sex: string;
  birthDate: string;
  tall: string;
  job: string;
  introduce: string;
  preference: string;
  profileImage: string;

  constructor(user: User) {
    this.nickname = user.nickname;
    this.sex = user.sex;
    this.birthDate = user.birthDate;
    this.tall = user.tall;
    this.job = user.job;
    this.introduce = user.introduce;
    this.preference = user.preference;
    this.profileImage = user.profileImage;
  }
}
