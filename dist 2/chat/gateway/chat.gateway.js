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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_entity_1 = require("../database/entity/chat.entity");
const common_1 = require("@nestjs/common");
const moment = require("moment-timezone");
const chat_socekr_message_dto_1 = require("../dtos/request/chat.socekr.message.dto");
const recognize_service_1 = require("../../recognize/recognize.service");
const chat_message_repository_1 = require("../database/repository/chat.message.repository");
const chat_repository_1 = require("../database/repository/chat.repository");
let ChatGateway = class ChatGateway {
    constructor(chatsRepository, chatMessagesRepository, recognizeService) {
        this.chatsRepository = chatsRepository;
        this.chatMessagesRepository = chatMessagesRepository;
        this.recognizeService = recognizeService;
        this.statusMessages = {
            [chat_entity_1.ChatState.PENDING]: "채팅이 연결 되었습니다",
            [chat_entity_1.ChatState.OPEN]: "채팅이 시작 되었습니다",
            [chat_entity_1.ChatState.SENDER_EXIT]: "상대방이 채팅을 종료하였습니다",
            [chat_entity_1.ChatState.RECEIVER_EXIT]: "상대방이 채팅을 종료하였습니다",
            [chat_entity_1.ChatState.EXPIRE_END]: "채팅방 오픈 가능 시간이 만료되어 종료 되었습니다",
            [chat_entity_1.ChatState.DISCONNECT_END]: "채팅방 사용 시간이 만료되어 종료 되었습니다",
        };
    }
    async handleConnection(client) {
        const roomId = client.handshake.query.roomId;
        const chatRoom = await this.chatsRepository.findOneChatRoomsByChatId(Number(roomId));
        if (!chatRoom) {
            throw new common_1.NotFoundException("존재하지 않는 채팅방 입니다");
        }
        try {
            client.join(roomId);
            console.log(`ChatRoom Socket Connect! clientId : ${client.id}`);
            console.log(`ChatRoom Socket Connect! rommId : ${roomId}`);
            const messagesArray = await this.chatMessagesRepository.findChatMsgByChatId(chatRoom.id);
            const emitMessage = await this.combineMessageToClient(messagesArray, chatRoom.status);
            console.log(emitMessage);
            this.server.to(chatRoom.id.toString()).emit("message_list", emitMessage);
        }
        catch (e) {
            console.error("handleConnection :", e);
            throw new common_1.NotFoundException("채팅방 입장에 실패 했습니다");
        }
    }
    async handleDisconnect(client) {
        const roomId = client.handshake.query.roomId;
        const chatRoom = await this.chatsRepository.findOneChatRoomsByChatId(Number(roomId));
        if (!chatRoom) {
            return;
        }
        try {
            console.log(`ChatRoom Socket Disconnect! clientId : ${client.id}`);
            console.log(`ChatRoom Socket Disconnect! roomId : ${roomId}`);
            const messagesArray = await this.chatMessagesRepository.findChatMsgByChatId(chatRoom.id);
            const emitMessage = await this.combineMessageToClient(messagesArray, chatRoom.status);
            console.log("디스커넥트 된 status : ", chatRoom.status);
            this.server.to(chatRoom.id.toString()).emit("message_list", emitMessage);
            this.server.to(chatRoom.id.toString()).emit("status", chatRoom.status);
        }
        catch (e) {
            console.error("handleDisconnect :", e);
            throw new common_1.NotFoundException("채팅방 종료에 실패 했습니다");
        }
    }
    async handleMessage(msg, client) {
        const token = client.handshake?.auth?.token;
        const user = await this.recognizeService.verifyWebSocketToken(token);
        const roomId = client.handshake.query.roomId;
        const chatRoom = await this.chatsRepository.findOneChatRoomsByChatId(Number(roomId));
        if (!chatRoom) {
            throw new common_1.NotFoundException("존재하지 않는 채팅방 입니다");
        }
        try {
            const savedMessage = await this.chatMessagesRepository.saveChatMsgData(user, chatRoom, msg.message, msg.date);
            const messageData = {
                id: savedMessage.id,
                chatRoomId: savedMessage.chatRoom.id,
                content: savedMessage.content,
                senderId: savedMessage.sender.id,
                senderNickname: savedMessage.sender.nickname,
                createdAt: moment(savedMessage.createdAt).format("YYYY-MM-DD HH:mm:ss"),
            };
            this.server.to(messageData.chatRoomId.toString()).emit("message", messageData);
        }
        catch (e) {
            console.error("handleMessage :", e);
            throw new common_1.InternalServerErrorException("메시지 저장 도중 오류 발생 했습니다");
        }
    }
    async combineMessageToClient(chatMessage, status) {
        try {
            const regularmessages = chatMessage.map((msg) => {
                return {
                    id: msg.id,
                    roomId: msg.chatRoom.id,
                    content: msg.content,
                    senderId: msg.sender.id,
                    senderNickname: msg.sender.nickname,
                    createdAt: moment(msg.createdAt).format("YYYY-MM-DD HH:mm:ss"),
                };
            });
            const statusSystemMessage = this.statusMessages[status] || "채팅방 상태 확인 불가능";
            const systemMessage = {
                type: "system",
                content: statusSystemMessage,
                createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            let emitMessage;
            if (status === chat_entity_1.ChatState.OPEN || status === chat_entity_1.ChatState.PENDING) {
                emitMessage = [systemMessage, ...regularmessages];
            }
            else {
                emitMessage = [...regularmessages, systemMessage];
            }
            return emitMessage;
        }
        catch (e) {
            console.error("combineMessageToClient :", e);
            throw new common_1.InternalServerErrorException("채팅 메시지 배열 결합에 실패했습니다");
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("message"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_socekr_message_dto_1.socketMessageReqDto, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: "chats" }),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => recognize_service_1.RecognizeService))),
    __metadata("design:paramtypes", [chat_repository_1.ChatsRepository,
        chat_message_repository_1.ChatMessagesRepository,
        recognize_service_1.RecognizeService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map