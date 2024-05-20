import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatMessage } from "./chat.message.entity";

export enum ChatState {
  PENDING = "PENDING",
  OPEN = "OPEN",
  DISCONNECT_END = "DISCONNECT_END",
  EXPIRE_END = "EXPIRE_END",
  RECEIVER_EXIT = "RECEIVER_EXIT",
  SENDER_EXIT = "SENDER_EXIT",
}

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  matchId: number;

  @Column()
  senderId: number;

  @Column()
  receiverId: number;

  @Column({ type: "enum", enum: ChatState, default: ChatState.PENDING })
  status: string;

  @OneToMany(() => ChatMessage, (message) => message.chatRoom)
  message: ChatMessage[];

  @Column({ default: 0 })
  messageCount: number;

  @Column()
  expireTime: Date;

  @Column({ default: null })
  disconnectTime: Date;

  @CreateDateColumn()
  createdAt: string;
}
