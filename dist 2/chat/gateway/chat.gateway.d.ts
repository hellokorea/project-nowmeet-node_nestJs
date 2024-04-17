import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatMessage } from "../database/entity/chat.message.entity";
import { socketMessageReqDto } from "../dtos/request/chat.socekr.message.dto";
import { RecognizeService } from "src/recognize/recognize.service";
import { ChatMessagesRepository } from "../database/repository/chat.message.repository";
import { ChatsRepository } from "../database/repository/chat.repository";
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatsRepository;
    private readonly chatMessagesRepository;
    private readonly recognizeService;
    server: Server;
    constructor(chatsRepository: ChatsRepository, chatMessagesRepository: ChatMessagesRepository, recognizeService: RecognizeService);
    private statusMessages;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleMessage(msg: socketMessageReqDto, client: Socket): Promise<void>;
    combineMessageToClient(chatMessage: ChatMessage[], status: string): Promise<any>;
}
