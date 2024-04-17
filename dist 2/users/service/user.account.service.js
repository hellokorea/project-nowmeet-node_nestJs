"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAccountService = void 0;
const common_1 = require("@nestjs/common");
const users_repository_1 = require("../database/repository/users.repository");
const match_repository_1 = require("../../match/database/repository/match.repository");
const typeorm_1 = require("typeorm");
const aws_service_1 = require("../../aws.service");
const recognize_service_1 = require("../../recognize/recognize.service");
const chat_repository_1 = require("./../../chat/database/repository/chat.repository");
const chat_message_repository_1 = require("./../../chat/database/repository/chat.message.repository");
let UserAccountService = class UserAccountService {
    constructor(recognizeService, usersRepository, matchRepository, chatsRepository, chatMessagesRepository, connection, awsService) {
        this.recognizeService = recognizeService;
        this.usersRepository = usersRepository;
        this.matchRepository = matchRepository;
        this.chatsRepository = chatsRepository;
        this.chatMessagesRepository = chatMessagesRepository;
        this.connection = connection;
        this.awsService = awsService;
    }
    async getMyUserInfo(req) {
        const loggedId = req.user.id;
        const user = await this.recognizeService.validateUser(loggedId);
        try {
            user.profileImages = Array(3)
                .fill("undefined")
                .map((_, i) => (user.profileImages[i] === undefined ? "undefined" : user.profileImages[i]));
            const preSignedUrl = await this.awsService.createPreSignedUrl(user.profileImages);
            return { user, PreSignedUrl: preSignedUrl };
        }
        catch (e) {
            console.error("getMyUserInfo :", e);
            throw new common_1.InternalServerErrorException("내 정보를 갖고오는데 실패 했습니다.");
        }
    }
    async putMyJobInfo(body, req) {
        try {
            const loggedId = req.user.id;
            const user = await this.recognizeService.validateUser(loggedId);
            const { job } = body;
            user.job = job;
            const updated = await this.usersRepository.saveUser(user);
            return updated.job;
        }
        catch (e) {
            console.error("putMyJobInfo :", e);
            throw new common_1.InternalServerErrorException("직업 정보를 업데이트하는 중 오류가 발생했습니다.");
        }
    }
    async putMyIntroduceInfo(body, req) {
        try {
            const loggedId = req.user.id;
            const user = await this.recognizeService.validateUser(loggedId);
            const { introduce } = body;
            user.introduce = introduce;
            const updated = await this.usersRepository.saveUser(user);
            return updated.introduce;
        }
        catch (e) {
            console.error("putMyIntroduceInfo :", e);
            throw new common_1.InternalServerErrorException("자기소개 정보를 업데이트하는 중 오류가 발생했습니다.");
        }
    }
    async putMyPreferenceInfo(body, req) {
        try {
            const loggedId = req.user.id;
            const user = await this.recognizeService.validateUser(loggedId);
            const { preference } = body;
            user.preference = preference;
            const updated = await this.usersRepository.saveUser(user);
            return updated.preference;
        }
        catch (e) {
            console.error("putMyPreferenceInfo Error:", e);
            throw new common_1.InternalServerErrorException("취향 정보를 업데이트하는 중 오류가 발생했습니다.");
        }
    }
    async putMyProfileImageAtIndex(index, req, files) {
        const loggedId = req.user.id;
        const user = await this.recognizeService.validateUser(loggedId);
        const indexNum = Number(index);
        if (indexNum > 2) {
            throw new common_1.BadRequestException("0 ~ 2까지 인덱스를 입력해주세요.");
        }
        try {
            const profileKey = await this.awsService.uploadFilesToS3("profileImages", files);
            const newKey = profileKey[0].key;
            const filterUserProifleImages = () => {
                user.profileImages[index] = newKey;
                user.profileImages = user.profileImages.filter((v) => v !== null);
                return user.profileImages;
            };
            if (user.profileImages[index]) {
                const oldeKey = user.profileImages[index];
                await this.awsService.deleteFilesFromS3([oldeKey]);
                filterUserProifleImages();
            }
            else {
                filterUserProifleImages();
            }
            const updated = await this.usersRepository.saveUser(user);
            user.profileImages = Array(3)
                .fill("undefined")
                .map((_, i) => (user.profileImages[i] === undefined ? "undefined" : user.profileImages[i]));
            const preSignedUrl = await this.awsService.createPreSignedUrl(updated.profileImages);
            return {
                updatedUser: user.profileImages,
                PreSignedUrl: preSignedUrl,
            };
        }
        catch (e) {
            console.error("putMyProfileImageAtIndex :", e);
            throw new common_1.BadRequestException("유저 프로필 사진 수정 중 문제가 발생했습니다.");
        }
    }
    async deleteUserProfilesKey(index, req) {
        const loggedId = req.user.id;
        const user = await this.recognizeService.validateUser(loggedId);
        const indexNum = Number(index);
        if (indexNum === 0) {
            throw new common_1.BadRequestException("0번째 사진은 삭제가 불가능합니다.");
        }
        if (indexNum > 2) {
            throw new common_1.BadRequestException("1 ~ 2까지 인덱스를 입력해주세요.");
        }
        if (user.profileImages[index] === undefined) {
            throw new common_1.NotFoundException("해당 Index는 비어있으므로 삭제가 되지 않습니다.");
        }
        try {
            const deleteToKey = user.profileImages[index];
            await this.awsService.deleteFilesFromS3([deleteToKey]);
            user.profileImages.splice(index, 1);
            user.profileImages = user.profileImages.filter((v) => v !== null);
            await this.usersRepository.saveUser(user);
            user.profileImages = Array(3)
                .fill("undefined")
                .map((_, i) => (user.profileImages[i] === undefined ? "undefined" : user.profileImages[i]));
            return { message: "Successfully deleted.", deleteKey: deleteToKey, userProfileImages: user.profileImages };
        }
        catch (e) {
            console.error("deleteUserProfilesKey :", e);
            throw new common_1.BadRequestException("유저 프로필 파일 키 삭제 도중 문제가 발생했습니다.");
        }
    }
    async deleteAccount(req) {
        const loggedId = req.user.id;
        const user = await this.recognizeService.validateUser(loggedId);
        if (!user) {
            throw new common_1.NotFoundException("존재하지 않는 유저 입니다");
        }
        try {
            await this.connection.transaction(async (txManager) => {
                await this.chatMessagesRepository.deleteMsgDataByUserId(txManager, loggedId);
                await this.chatsRepository.deleteChatDataByUserId(txManager, loggedId);
                await this.chatsRepository.deleteDevChatDataByUserId(txManager, loggedId);
                await this.matchRepository.deleteMatchesByUserId(txManager, loggedId);
                await this.matchRepository.deleteDevMatchesByUserId(txManager, loggedId);
                await this.awsService.deleteFilesFromS3(user.profileImages);
                await this.usersRepository.deleteUser(txManager, user);
            });
            return { message: `userId: ${loggedId} account delete success` };
        }
        catch (e) {
            console.error("Error during transaction:", e);
            throw new common_1.InternalServerErrorException(`userId: ${loggedId} 번 유저의 계정을 삭제하는 도중 오류가 발생했습니다`);
        }
    }
    async deleteMatchChats(req) {
        const loggedId = req.user.id;
        const user = await this.recognizeService.validateUser(loggedId);
        if (!user) {
            throw new common_1.NotFoundException("존재하지 않는 유저 입니다");
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
        }
        catch (e) {
            throw new common_1.InternalServerErrorException("테스트 삭제 api 실패!!!");
        }
    }
};
exports.UserAccountService = UserAccountService;
exports.UserAccountService = UserAccountService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => recognize_service_1.RecognizeService))),
    __metadata("design:paramtypes", [recognize_service_1.RecognizeService,
        users_repository_1.UsersRepository,
        match_repository_1.MatchRepository,
        chat_repository_1.ChatsRepository,
        chat_message_repository_1.ChatMessagesRepository,
        typeorm_1.Connection,
        aws_service_1.AwsService])
], UserAccountService);
//# sourceMappingURL=user.account.service.js.map