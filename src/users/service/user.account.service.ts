import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { UsersRepository } from "../database/repository/users.repository";
import { UserRequestDto } from "../dtos/request/users.request.dto";
import { MatchRepository } from "../../match/database/repository/match.repository";
import { Connection, In } from "typeorm";
import { AwsService } from "src/aws.service";
import { UpdateIntroduceDto, UpdateJobDto, UpdatePreferenceDto } from "../dtos/request/user.putMyInfo.dto";
import { RecognizeService } from "../../recognize/recognize.service";
import { ChatsRepository } from "./../../chat/database/repository/chat.repository";
import { ChatMessagesRepository } from "./../../chat/database/repository/chat.message.repository";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class UserAccountService {
  constructor(
    @Inject(forwardRef(() => RecognizeService))
    private readonly recognizeService: RecognizeService,
    private readonly usersRepository: UsersRepository,
    private readonly matchRepository: MatchRepository,
    private readonly chatsRepository: ChatsRepository,
    private readonly chatMessagesRepository: ChatMessagesRepository,
    private readonly connection: Connection,
    private readonly awsService: AwsService,
    private readonly redisService: RedisService
  ) {}

  async getMyUserInfo(req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.recognizeService.validateUser(loggedId);

    try {
      user.profileImages = Array(3)
        .fill("undefined")
        .map((_, i) => (user.profileImages[i] === undefined ? "undefined" : user.profileImages[i]));

      const preSignedUrl = await this.awsService.createPreSignedUrl(user.profileImages);
      return { user, PreSignedUrl: preSignedUrl };
    } catch (e) {
      console.error("getMyUserInfo :", e);
      throw new InternalServerErrorException("내 정보를 갖고오는데 실패 했습니다.");
    }
  }

  async putMyJobInfo(body: UpdateJobDto, req: UserRequestDto) {
    try {
      const loggedId = req.user.id;
      const user = await this.recognizeService.validateUser(loggedId);

      const { job } = body;

      user.job = job;

      const updated = await this.usersRepository.saveUser(user);

      return updated.job;
    } catch (e) {
      console.error("putMyJobInfo :", e);
      throw new InternalServerErrorException("직업 정보를 업데이트하는 중 오류가 발생했습니다.");
    }
  }

  async putMyIntroduceInfo(body: UpdateIntroduceDto, req: UserRequestDto) {
    try {
      const loggedId = req.user.id;
      const user = await this.recognizeService.validateUser(loggedId);

      const { introduce } = body;

      user.introduce = introduce;

      const updated = await this.usersRepository.saveUser(user);

      return updated.introduce;
    } catch (e) {
      console.error("putMyIntroduceInfo :", e);
      throw new InternalServerErrorException("자기소개 정보를 업데이트하는 중 오류가 발생했습니다.");
    }
  }

  async putMyPreferenceInfo(body: UpdatePreferenceDto, req: UserRequestDto) {
    try {
      const loggedId = req.user.id;
      const user = await this.recognizeService.validateUser(loggedId);

      const { preference } = body;

      user.preference = preference;

      const updated = await this.usersRepository.saveUser(user);

      return updated.preference;
    } catch (e) {
      console.error("putMyPreferenceInfo Error:", e);
      throw new InternalServerErrorException("취향 정보를 업데이트하는 중 오류가 발생했습니다.");
    }
  }

  async putMyProfileImageAtIndex(index: number, req: UserRequestDto, files: Array<Express.Multer.File>) {
    const loggedId = req.user.id;
    const user = await this.recognizeService.validateUser(loggedId);

    const indexNum = Number(index);

    if (indexNum > 2) {
      throw new BadRequestException("0 ~ 2까지 인덱스를 입력해주세요.");
    }

    try {
      const profileKey = await this.awsService.uploadFilesToS3("profileImages", files);
      const newKey = profileKey[0].key;

      //File Change
      const filterUserProifleImages = () => {
        user.profileImages[index] = newKey;
        user.profileImages = user.profileImages.filter((v) => v !== null);

        return user.profileImages;
      };

      if (user.profileImages[index]) {
        const oldeKey = user.profileImages[index];
        await this.awsService.deleteFilesFromS3([oldeKey]);
        filterUserProifleImages();
      } else {
        filterUserProifleImages();
      }

      const updated = await this.usersRepository.saveUser(user);

      //Res Array
      user.profileImages = Array(3)
        .fill("undefined")
        .map((_, i) => (user.profileImages[i] === undefined ? "undefined" : user.profileImages[i]));

      const preSignedUrl = await this.awsService.createPreSignedUrl(updated.profileImages);

      return {
        updatedUser: user.profileImages,
        PreSignedUrl: preSignedUrl,
      };
    } catch (e) {
      console.error("putMyProfileImageAtIndex :", e);
      throw new BadRequestException("유저 프로필 사진 수정 중 문제가 발생했습니다.");
    }
  }

  async deleteUserProfilesKey(index: number, req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.recognizeService.validateUser(loggedId);

    const indexNum = Number(index);

    if (indexNum === 0) {
      throw new BadRequestException("0번째 사진은 삭제가 불가능합니다.");
    }

    if (indexNum > 2) {
      throw new BadRequestException("1 ~ 2까지 인덱스를 입력해주세요.");
    }

    if (user.profileImages[index] === undefined) {
      throw new NotFoundException("해당 Index는 비어있으므로 삭제가 되지 않습니다.");
    }

    try {
      // File Delete
      const deleteToKey = user.profileImages[index];
      await this.awsService.deleteFilesFromS3([deleteToKey]);

      user.profileImages.splice(index, 1);
      user.profileImages = user.profileImages.filter((v) => v !== null);
      await this.usersRepository.saveUser(user);

      // Res Array
      user.profileImages = Array(3)
        .fill("undefined")
        .map((_, i) => (user.profileImages[i] === undefined ? "undefined" : user.profileImages[i]));

      return { message: "Successfully deleted.", deleteKey: deleteToKey, userProfileImages: user.profileImages };
    } catch (e) {
      console.error("deleteUserProfilesKey :", e);
      throw new BadRequestException("유저 프로필 파일 키 삭제 도중 문제가 발생했습니다.");
    }
  }

  async deleteAccount(req: UserRequestDto) {
    const loggedId = req.user.id;
    const user = await this.recognizeService.validateUser(loggedId);

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    try {
      await this.connection.transaction(async (txManager) => {
        await this.redisService.deleteMember(user.id);

        await this.chatMessagesRepository.deleteMsgDataByUserId(txManager, loggedId);

        await this.chatsRepository.deleteChatDataByUserId(txManager, loggedId);
        await this.chatsRepository.deleteDevChatDataByUserId(txManager, loggedId);

        await this.matchRepository.deleteMatchesByUserId(txManager, loggedId);
        await this.matchRepository.deleteDevMatchesByUserId(txManager, loggedId);

        await this.awsService.deleteFilesFromS3(user.profileImages);

        await this.usersRepository.deleteUser(txManager, user);
      });

      return { message: `userId: ${loggedId} account delete success` };
    } catch (e) {
      console.error("Error during transaction:", e);
      throw new InternalServerErrorException(`userId: ${loggedId} 번 유저의 계정을 삭제하는 도중 오류가 발생했습니다`);
    }
  }

  //^ test delete match
  async deleteMatchChats(req: UserRequestDto) {
    const loggedId = req.user.id;

    const user = await this.recognizeService.validateUser(loggedId);

    if (!user) {
      throw new NotFoundException("존재하지 않는 유저 입니다");
    }

    try {
      await this.connection.transaction(async (txManager) => {
        await this.chatMessagesRepository.deleteMsgDataByUserId(txManager, loggedId);

        await this.chatsRepository.deleteChatDataByUserId(txManager, loggedId);
        await this.chatsRepository.deleteDevChatDataByUserId(txManager, loggedId);

        await this.matchRepository.deleteMatchesByUserId(txManager, loggedId);
        await this.matchRepository.deleteDevMatchesByUserId(txManager, loggedId);
      });

      return { message: "테스트 삭제 api 실행" };
    } catch (e) {
      throw new InternalServerErrorException("테스트 삭제 api 실패!!!");
    }
  }
}
