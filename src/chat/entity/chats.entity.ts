import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatMessage } from "./chatmessage.entity";

export enum ChatState {
  PENDING = "PENDING",
  OPEN = "OPEN",
  DISCONNECT_END = "DISCONNECT_END",
  EXIPRE_END = "EXIPRE_END",
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

  @Column()
  expireTime: Date;

  @Column({ default: null })
  disconnectTime: Date;

  @CreateDateColumn()
  createdAt: string;
}
