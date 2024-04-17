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
exports.MatchController = void 0;
const common_1 = require("@nestjs/common");
const success_interceptor_1 = require("../../common/interceptors/success.interceptor");
const match_service_1 = require("../service/match.service");
const swagger_1 = require("@nestjs/swagger");
const match_sendLikeResonse_dto_1 = require("../dtos/request/match.sendLikeResonse.dto");
const match_likeBoxResponse_dto_1 = require("../dtos/response/match.likeBoxResponse.dto");
const match_matchResultResponse_dto_1 = require("../dtos/response/match.matchResultResponse.dto");
const chat_listAllResopnse_dto_1 = require("../../chat/dtos/response/chat.listAllResopnse.dto");
const chat_chatRoomResponse_dto_1 = require("../../chat/dtos/response/chat.chatRoomResponse.dto");
const user_getProfiles_dto_1 = require("../../users/dtos/response/user.getProfiles.dto");
const chat_open_dto_1 = require("../../chat/dtos/response/chat.open.dto");
const jwt_guard_1 = require("../../auth/jwt/jwt.guard");
const match_profile_service_1 = require("../service/match.profile.service");
const match_chat_box_service_1 = require("../service/match.chat.box.service");
const match_chat_service_1 = require("../service/match.chat.service");
let MatchController = class MatchController {
    constructor(matchProfileService, matchService, matchBoxService, matchChatService) {
        this.matchProfileService = matchProfileService;
        this.matchService = matchService;
        this.matchBoxService = matchBoxService;
        this.matchChatService = matchChatService;
    }
    getUserProfile(nickname, req) {
        return this.matchProfileService.getUserProfile(nickname, req);
    }
    userLikeSend(nickname, req) {
        return this.matchService.sendLike(nickname, req);
    }
    acceptLike(matchId, req) {
        return this.matchService.matchAccept(matchId, req);
    }
    rejectLike(matchId, req) {
        return this.matchService.matchReject(matchId, req);
    }
    getLikeSendBox(req) {
        return this.matchBoxService.getLikeSendBox(req);
    }
    getLikeReceiveBox(req) {
        return this.matchBoxService.getLikeReceiveBox(req);
    }
    getChatRommsList(req) {
        return this.matchChatService.getChatRoomsAllList(req);
    }
    getUserChatRoom(chatId, req) {
        return this.matchChatService.getUserChatRoom(chatId, req);
    }
    openChatRoom(chatId, req) {
        return this.matchChatService.openChatRoom(chatId, req);
    }
    exitChatRoom(chatId, req) {
        return this.matchChatService.exitChatRoom(chatId, req);
    }
    deleteChatRoom(chatId, req) {
        return this.matchChatService.deleteChatRoom(chatId, req);
    }
};
exports.MatchController = MatchController;
__decorate([
    (0, swagger_1.ApiResponse)({ type: user_getProfiles_dto_1.GetProfileResponseDto }),
    (0, swagger_1.ApiOperation)({ summary: "유저 프로필 조회" }),
    (0, swagger_1.ApiParam)({ name: "nickname", description: "유저 닉네임 입력", type: String }),
    (0, common_1.Get)("profile/:nickname"),
    __param(0, (0, common_1.Param)("nickname")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MatchController.prototype, "getUserProfile", null);
__decorate([
    (0, swagger_1.ApiResponse)({ type: match_sendLikeResonse_dto_1.SendLikeResponseDto }),
    (0, swagger_1.ApiOperation)({ summary: "유저 좋아요 전송" }),
    (0, swagger_1.ApiParam)({ name: "nickname", description: "좋아요 보낼 유저 닉네임 입력", type: String }),
    (0, common_1.Post)("profile/:nickname/like"),
    __param(0, (0, common_1.Param)("nickname")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MatchController.prototype, "userLikeSend", null);
__decorate([
    (0, swagger_1.ApiResponse)({ type: match_matchResultResponse_dto_1.MatchAcceptResponseDto }),
    (0, swagger_1.ApiOperation)({ summary: "수신함에서 유저 좋아요 수락" }),
    (0, swagger_1.ApiParam)({ name: "matchId", description: "좋아요 수락할 matchId 입력", type: Number }),
    (0, common_1.Post)("me/receiveBox/:matchId/accept"),
    __param(0, (0, common_1.Param)("matchId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MatchController.prototype, "acceptLike", null);
__decorate([
    (0, swagger_1.ApiResponse)({ type: match_matchResultResponse_dto_1.MatchRejectResponseDto }),
    (0, swagger_1.ApiOperation)({ summary: "수신함에서 유저 좋아요 거절" }),
    (0, common_1.Post)("me/receiveBox/:matchId/reject"),
    (0, swagger_1.ApiParam)({ name: "matchId", description: "좋아요 거절할 matchId 입력", type: Number }),
    __param(0, (0, common_1.Param)("matchId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MatchController.prototype, "rejectLike", null);
__decorate([
    (0, swagger_1.ApiResponse)({ type: match_likeBoxResponse_dto_1.SendBoxResponseDto, isArray: true }),
    (0, swagger_1.ApiOperation)({ summary: "내가 보낸 좋아요 발신함" }),
    (0, common_1.Get)("me/sendBox"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MatchController.prototype, "getLikeSendBox", null);
__decorate([
    (0, swagger_1.ApiResponse)({ type: match_likeBoxResponse_dto_1.ReceiveBoxResponseDto, isArray: true }),
    (0, swagger_1.ApiOperation)({ summary: "내가 받은 좋아요 수신함" }),
    (0, common_1.Get)("me/receiveBox"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MatchController.prototype, "getLikeReceiveBox", null);
__decorate([
    (0, swagger_1.ApiResponse)({ type: chat_listAllResopnse_dto_1.ChatAllListResponseDto, isArray: true }),
    (0, swagger_1.ApiOperation)({ summary: "나의 채팅 리스트 모두 조회 " }),
    (0, common_1.Get)("me/chatBox/all"),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MatchController.prototype, "getChatRommsList", null);
__decorate([
    (0, swagger_1.ApiResponse)({ type: chat_chatRoomResponse_dto_1.ChatRoomResponseDto }),
    (0, swagger_1.ApiOperation)({ summary: "해당 채팅방으로 입장" }),
    (0, swagger_1.ApiParam)({ name: "chatId", description: "chatId 입력", type: Number }),
    (0, common_1.Get)("me/chatBox/:chatId"),
    __param(0, (0, common_1.Param)("chatId")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MatchController.prototype, "getUserChatRoom", null);
__decorate([
    (0, swagger_1.ApiResponse)({ type: chat_open_dto_1.OpenChatResponseDto }),
    (0, swagger_1.ApiOperation)({ summary: "채팅방 오픈" }),
    (0, swagger_1.ApiParam)({ name: "chatId", description: "오픈할 chatId 입력", type: Number }),
    (0, common_1.Post)("me/chatBox/:chatId/open"),
    __param(0, (0, common_1.Param)("chatId")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MatchController.prototype, "openChatRoom", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "채팅방 나가기" }),
    (0, swagger_1.ApiParam)({ name: "chatId", description: "나갈 chatId 입력", type: Number }),
    (0, common_1.Put)("me/chatBox/:chatId/exit"),
    __param(0, (0, common_1.Param)("chatId")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MatchController.prototype, "exitChatRoom", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "채팅방 삭제" }),
    (0, swagger_1.ApiParam)({ name: "chatId", description: "삭제할 chatId 입력", type: Number }),
    (0, common_1.Delete)("me/chatBox/:chatId/delete"),
    __param(0, (0, common_1.Param)("chatId")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MatchController.prototype, "deleteChatRoom", null);
exports.MatchController = MatchController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)("match"),
    (0, common_1.UseGuards)(jwt_guard_1.CustomJwtGuards),
    (0, common_1.UseInterceptors)(success_interceptor_1.SuccessInterceptor),
    __metadata("design:paramtypes", [match_profile_service_1.MatchProfileService,
        match_service_1.MatchService,
        match_chat_box_service_1.MatchBoxService,
        match_chat_service_1.MatchChatService])
], MatchController);
//# sourceMappingURL=match.controller.js.map