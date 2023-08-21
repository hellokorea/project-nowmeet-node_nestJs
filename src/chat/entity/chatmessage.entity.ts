import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatRoom } from "./chats.entity";
import { User } from "src/users/entity/users.entity";

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.message)
  chatRoom: ChatRoom;

  @ManyToOne(() => User)
  sender: User;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: string;
}
