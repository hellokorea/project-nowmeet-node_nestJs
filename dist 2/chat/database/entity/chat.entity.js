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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoom = exports.ChatState = void 0;
const typeorm_1 = require("typeorm");
const chat_message_entity_1 = require("./chat.message.entity");
var ChatState;
(function (ChatState) {
    ChatState["PENDING"] = "PENDING";
    ChatState["OPEN"] = "OPEN";
    ChatState["DISCONNECT_END"] = "DISCONNECT_END";
    ChatState["EXPIRE_END"] = "EXPIRE_END";
    ChatState["RECEIVER_EXIT"] = "RECEIVER_EXIT";
    ChatState["SENDER_EXIT"] = "SENDER_EXIT";
})(ChatState || (exports.ChatState = ChatState = {}));
let ChatRoom = class ChatRoom {
};
exports.ChatRoom = ChatRoom;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ChatRoom.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ChatRoom.prototype, "matchId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ChatRoom.prototype, "senderId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ChatRoom.prototype, "receiverId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ChatState, default: ChatState.PENDING }),
    __metadata("design:type", String)
], ChatRoom.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chat_message_entity_1.ChatMessage, (message) => message.chatRoom),
    __metadata("design:type", Array)
], ChatRoom.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], ChatRoom.prototype, "expireTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", Date)
], ChatRoom.prototype, "disconnectTime", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", String)
], ChatRoom.prototype, "createdAt", void 0);
exports.ChatRoom = ChatRoom = __decorate([
    (0, typeorm_1.Entity)()
], ChatRoom);
//# sourceMappingURL=chat.entity.js.map